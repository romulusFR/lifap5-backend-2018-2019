#!/bin/bash
# here the path to jmeter
PATH_JMETER=/home/romulus/Development/apache-jmeter-5.1.1/bin/

rm -f results
rm -rf webreport
$PATH_JMETER/jmeter -n -t ./lifap5-jmeter-testplan-thinking.jmx -l results -e -o ./webreport
