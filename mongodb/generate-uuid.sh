#!/bin/bash
cd $(dirname $0)
MYDIR=$(cd $(dirname $0);pwd)
echo $MYDIR

./gen-api-keys.py ids-students.tsv keys-students.tsv
./gen-api-keys.py ids-profs.tsv keys-profs.tsv
