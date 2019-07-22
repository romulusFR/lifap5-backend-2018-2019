#!/bin/bash
cd $(dirname $0)
MYDIR=$(cd $(dirname $0);pwd)
echo $MYDIR

###### users #####

# on nettoie
mongo lifap5-backend --eval "db.users.drop()"
#index qui vont garantir l'unicité
mongo lifap5-backend --eval "db.users.createIndex({'apikey' : 1}, {unique : true})"
mongo lifap5-backend --eval "db.users.createIndex({'login' : 1}, {unique : true})"

# import à partir des fichiers TSV
# on importe les deux collections d'utilisateurs : étudiant-e-s et enseignant-e-s
mongoimport --uri mongodb://localhost:27017/lifap5-backend --collection users --columnsHaveTypes --fields "login.string(),apikey.string()" --type tsv --file $MYDIR/keys-students.tsv
mongoimport --uri mongodb://localhost:27017/lifap5-backend --collection users --columnsHaveTypes --fields "login.string(),apikey.string()" --type tsv --file $MYDIR/keys-profs.tsv

#on ajoute la date d'import
mongo lifap5-backend --eval "db.users.update({}, { '\$set': { 'joined_on': new Date() }}, {multi:true})"

###### topics #####

# on nettoie
mongo lifap5-backend --eval "db.topics.drop()"

# on ajoute les topics
mongoimport --uri mongodb://localhost:27017/lifap5-backend --collection topics --drop --jsonArray --type json --file $MYDIR/Projet-2019-topics.json
#on ajoute la date d'import
#mongo lifap5-backend --eval "db.topics.update({}, { '\$set': { 'date': new Date() }}, {multi:true})"

