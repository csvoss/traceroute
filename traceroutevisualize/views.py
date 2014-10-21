# Create your views here.
from django.shortcuts import render
from django.contrib.auth import *
from django.contrib.auth.models import User
from django.contrib.auth.forms import PasswordResetForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMessage
from django.utils import timezone
from django.utils.html import escape
from django.contrib.gis.geoip import GeoIP
import json
import urllib2
#import os
import subprocess
import sys
import csv
import traceback

def home(request):
    return render(request, 'index.html', {})

@csrf_exempt
def req(request):
    urlorip = str(request.GET['val'])
    retval = trace(urlorip)
    return HttpResponse(json.dumps(retval))

#return a list of items which are returned by getData
def trace(urlorip):
    try:
        urlorip = urlorip.replace("http://","").replace("https://","").split("/")[0]
        g = GeoIP(path="traceroutevisualize/geoip")
        #cmd = "traceroute -w 3 -q 1 "+str(urlorip)

        output = []

        cmdoutput = subprocess.check_output(["traceroute", "-w", "3", "-q", "1", str(urlorip)])

        for line in cmdoutput.splitlines():
            tokens = [x for x in (line.split(' ')) if x!=""]
            if tokens[0] != "traceroute" and len(tokens) >= 3:
                output.append(tokens[2][1:-1])

        out = makeHtmlStrings([getData(x, g) for x in output if not x==""])

        if len(out)==0 and not "www." in urlorip:
            return trace("www."+urlorip)

        return out

    except Exception as e:
        return ""
        return traceback.format_exc() ## For debugging

#convert a list of:
#(lat, long, ISP, IP)
#into a list of:
#(lat, long, contentHtml, IP)
def makeHtmlStrings(dataList):
    oldLat = "142857"
    oldLng = "142857"
    oldISP = ""
    oldIP = ""
    buildContent = ""
    output = []
    i = 1
    for (lat, lng, isp, ip) in dataList:
        if not (lat==oldLat and lng==oldLng and isp==oldISP):
            buildContent += "</div>"
            output.append((oldLat, oldLng, buildContent, oldIP))
            buildContent = "<div class=hacker><u>"+isp+"</u><br>"
        if i==1:
            buildContent += "START<br>"
        buildContent += "Step "+str(i)+": <i>"+ip+"</i><br>"

        i+=1

        oldLat = lat
        oldLng = lng
        oldISP = isp
        oldIP = ip

    buildContent += "END</div>"
    output.append((oldLat, oldLng, buildContent, oldIP))

    return output[1:]


#getData method returns tuple:
#(lat, long, ISP, IP)
def getData(ip, g):
    #return (0,0,"Don't panic, I'm testing something right now", "Unknown")
    ( o1, o2, o3, o4 ) = ip.split('.')

    ipnum = (16777216 * int(o1)) + (65536 * int(o2)) + (256 * int(o3)) + int(o4)

    """
    glcb = csv.reader(open("traceroutevisualize/geoip/GeoLiteCity-Blocks.csv"))
    locID = -1
    glcb.next()
    glcb.next()
    #Find the location ID
    for row in glcb:
        if ipnum >= int(row[0]) and ipnum <= int(row[1]):
            locID = int(row[2])
            break
    """
    #Note that IpNum is NOT an IP address!
    #GeoLiteCity-Blocks.csv:
    #From col3 onward:
    # startIpNum endIpNum  locID

    (lat, lng) = g.lat_lon(ip)
    """
    glcl = csv.reader(open("traceroutevisualize/geoip/GeoLiteCity-Location.csv"))
    lat = "0"
    lng = "0"
    glcl.next()
    glcl.next()
    #Find the lat and lng
    for row in glcl:
        if int(row[0]) == locID:
            lat = row[5]
            lng = row[6]
            break
    """
    #GeoLiteCity-Location.csv:
    #From col3 onward:
    # locID countrycode region(null) city(null) postalCode(null) lat lng metroCode(null) areaCode(null)

    #isp = g.org_by_name(ip)

    #c = g.city(ip)

    #isp = ', '.join([x for x in (c['city'], c['region'], c['country_name']) if not x==None])

    isp = ""

    
    gin2 = csv.reader(open("traceroutevisualize/geoip/GeoIPASNum2.csv"))
    isp = "Unknown"
    #Find the ISP
    for row in gin2:
        if ipnum >= int(row[0]) and ipnum <= int(row[1]):
            isp = ' '.join(row[2].split(' ')[1:])
    

    #GeoIPASNum2.csv
    #From col1 onward: 
    # startIpNum endIpNum ISP
    #ISP := randommeaninglesstoken actualISP

    #gicw = csv.reader(open("traceroutevisualize/geoip/GeoIPCountryWhois.csv"))
    
    #GeoIPCountryWhois.csv
    #From col1 onward:
    # ipstart ipend startIpNum endIpNum countrycode countryname

    return (lat, lng, isp, ip)



