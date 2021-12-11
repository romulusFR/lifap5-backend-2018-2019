---
header-includes:
    <meta name="keywords" content="LIFAP5, programmation fonctionnelle,Javascript" />
    <meta name="description" content="Projet de l'UE LIFAP5 - 2018-2019 - UCBL - FST - Informatique" />
    <meta charset="UTF-8">
lang:
    fr
pagetitle:
    LIFAP5 - Projet - documentation backend
---

ARCHIVE - LIFAP5 - Projet 2018-2019 : documentation backend
=================================================


Ce document est le guide de développement et de référence du serveur du projet 2018-2019 de l'unité d'enseignement [LIFAP5 "Programmation fonctionnelle pour le WEB"](https://perso.liris.cnrs.fr/romuald.thion/dokuwiki/doku.php?id=enseignement:lifap5:start) en licence 2 informatique UCBL. 

Ce document d'écrit la réalisation d'un serveur REST devant une base Mongo écrit en Node/Express/Mongoose.
Un point websocket est aussi offert pour que le client puisse recevoir à la volée les modifications effectuées par les autres utilisateurs.

Site LIFAP5
-----------

* <https://perso.liris.cnrs.fr/romuald.thion/dokuwiki/doku.php?id=enseignement:lifap5:start>
* <https://perso.liris.cnrs.fr/romuald.thion/files/Enseignement/LIFAP5/Projet-2019P/LIFAP5-2019P-Projet-sujet.html>
  
Dépôt de code
-------------

* Sur github <https://github.com/romulusFR/lifap5-backend-2018-2019>
* Sur Renater <https://sourcesup.renater.fr/projects/lifap5/> (accès restreint)

```bash
sudo apt install subversion
svn checkout --username rthion https://subversion.renater.fr/lifap5/trunk/Projet
```

TODO prochaine version
----------------------

* Documentation du code <http://usejsdoc.org/>
* Logging : <https://www.npmjs.com/package/winston>
* Description de l'API : <https://swagger.io/tools/open-source/>
* Sécurité :
    * `x-api-key` hashé en base avec <https://www.npmjs.com/package/bcrypt>
    * <www.passportjs.org>
* Séparer topics et posts dans MongoDB
* Pagination des topics et posts

Documentations de référence
---------------------------

### Mongooose

* <https://mongoosejs.com/docs/guides.html>
* <https://mongoosejs.com/docs/api.html>

### Boostrap

* <https://getbootstrap.com/docs/4.3/getting-started/introduction/>

### Node/Express

* <https://nodejs.org/docs/latest-v10.x/api/index.html>
* <https://expressjs.com/en/4x/api.html>

### WebSockets

* <https://www.npmjs.com/package/ws>
* <https://github.com/websockets/ws/blob/HEAD/doc/ws.md>
* <https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API>

### Bonnes pratiques js/node/express

* <https://expressjs.com/en/guide/error-handling.html>
* <https://expressjs.com/en/advanced/best-practice-performance.html>
* <https://expressjs.com/en/advanced/best-practice-security.html>
* <https://github.com/i0natan/nodebestpractices>
* <https://github.com/i0natan/nodebestpractices#6-security-best-practices>

Installation environnement de développement
===========================================

Ci dessous, la création pas-à-pas du projet. Le fichier [`./backend/package.json`](./backend/package.json) contient déjà toutes les dépendences.
Une fois Mongo d'installé, installer les dépendances et exécuter le serveur ainsi :

```bash
# création de la base mongodb
cd backend
npm install
npm start # lancé en mode développement par défaut
curl http://localhost:3000/topics/ # doit afficher une liste de topics avec leur créateur
npm test  # lance les tests automatisés avec newman : les 178 assertions doivent être OK
```

Installation Nodejs
-------------------

* <https://github.com/nodesource/distributions#deb>
* <https://github.com/nodesource/distributions/blob/master/README.md>
* <https://www.npmjs.com/package/npm-check-updates>
* <https://www.npmjs.com/package/nodemon>
* <https://www.npmjs.com/package/newman>

```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -  
sudo apt-get install -y nodejs  

npm install -g npm-check-updates
npm install -g nodemon  
npm install -g newman
npm install -g pm2

nodejs --version
> v10.15.3
nodemon  --version
> 1.18.10
ncu --version
> 3.1.2
newman --version
> 4.4.1
pm2 --version
> 3.4.1
```

Installation Mongodb
--------------------

* <https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/>

```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --keyserver-options http-proxy=http://proxy.univ-lyon1.fr:3128 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

sudo service mongod start

mongo --version
> MongoDB shell version v4.0.7
mongod --version
> db version v4.0.7
```



### Initialisation du replica set

Pour permettre de suivre en live les màj sur le serveur avec les websockets. Voir :

* <https://docs.mongodb.com/manual/replication/>
* <https://docs.mongodb.com/manual/changeStreams/>
* <https://docs.mongodb.com/manual/reference/change-events/>

Dans `/etc/mongod.conf`

```yaml
replication:
  replSetName: "replica-local"
```

```javascript
> rs.initiate()
{
  "info2" : "no configuration specified. Using a default configuration for the set",
  "me" : "127.0.0.1:27017",
  "ok" : 1,
  "operationTime" : Timestamp(1554897388, 1),
  "$clusterTime" : {
    "clusterTime" : Timestamp(1554897388, 1),
    "signature" : {
      "hash" : BinData(0,"AAAAAAAAAAAAAAAAAAAAAAAAAAA="),
      "keyId" : NumberLong(0)
    }
  }
}
```

Scaffolding initial express
---------------------------

* [Exemple de départ](https://codeburst.io/writing-a-crud-app-with-node-js-and-mongodb-e0827cbbdafb)
* Voir des outils comme <https://yeoman.io/>

### Bibliothèques utilisées

* <http://expressjs.com/>
* <https://mongoosejs.com/>
* <https://www.npmjs.com/package/body-parser>
* <https://www.npmjs.com/package/debug>
* <https://www.npmjs.com/package/cors>
* <https://www.npmjs.com/package/helmet>
* <https://www.npmjs.com/package/ws>
* <https://www.npmjs.com/package/serve-favicon>
* <https://www.npmjs.com/package/eslint>
* <https://www.npmjs.com/package/eslint-config-eslint>
* <https://www.npmjs.com/package/eslint-plugin-node>
* <https://www.npmjs.com/package/eslint-plugin-security>

### Installation lib node

Dans dossier [``./backend``](./backend)

```bash
npm init

npm install --save mongoose

npm install --save express
npm install --save body-parser
npm install --save cors
npm install --save helmet
npm install --save serve-favicon
npm install --save ws

npm install --save debug
npm install --save make-promises-safe

npm install --save-dev eslint-plugin-security
npm install --save-dev eslint-plugin-node
npm install --save-dev eslint-config-eslint


npm audit fix
```

Création de la base `mongodb`
-----------------------------

### Initialisation

* Pour générer les clefs d'API avec `gen-api-keys.py`, voir le script [`./mongodb/generate-uuid.sh`](./mongodb/generate-uuid.sh)
* Voir script [`./mongodb/install-mongo-tsv.sh`](./mongodb/install-mongo-tsv.sh) permet de créer la base.

Les tests suivants devraient renvoyer des extraits de la collection

```bash
mongo lifap5-backend --eval "db.users.findOne()"
mongo lifap5-backend --eval "db.users.find({login : 'test'})"
mongo lifap5-backend --eval "db.topics.findOne()"
```

### Pour exporter/importer manuellement

```bash
mongoexport --db=lifap5-backend --collection=topics --pretty --jsonArray  > Projet-2019-topics.json

mongoexport --db=lifap5-backend --collection=users --pretty --jsonArray > Projet-2019-users-full.json
mongoexport --db=lifap5-backend --collection=users --pretty --jsonArray --fields=login,_id,joined_on > Projet-2019-users.json
```

Dockerisation
-------------

* <https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository>
* <https://docs.docker.com/install/linux/linux-postinstall/>

Voir fichiers

* <https://docs.docker.com/compose/install/>
* <https://nodejs.org/de/docs/guides/nodejs-docker-webapp/>
* Images mongo/node
    * <https://hub.docker.com/_/mongo>
    * <https://hub.docker.com/_/node>
* <https://docs.docker.com/compose/startup-order/>
    * <https://github.com/vishnubob/wait-for-it>

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

Commandes de base

```bash
docker images
docker system df
docker-compose build


docker exec -it projet_mongo_1 mongo -u root -p 'lifap5-backend-2018' --authenticationDatabase admin lifap5-backend
docker exec -it projet_mongo_1 pwd
```

Test automatisés et debug
=========================

Mode debug
----------

* `DEBUG=lifap5:*` pour activer le module `debug`
* Le flag active aussi le debug de `mongoose`
* Mis dans les scripts `dev` de `package.json` qui utilise `nodemon`

```bash
npm run start:dev
```

Postman
-------

Dans dossier [``./tests``](./tests)

* plan de test `lifap5-backend.postman_collection.json`
* variables d'environnement `lifap5-backend-env.postman_environment.json`
* script de lancement avec <https://github.com/postmanlabs/newman> dans la target `test` de `./backend/package.json`

### Références

* <https://learning.getpostman.com/docs/postman/scripts/test_scripts/>
* <https://learning.getpostman.com/docs/postman/scripts/test_examples>
* <https://learning.getpostman.com/docs/postman/environments_and_globals/variables>

JMeter
----------

Dans dossier [``./tests``](./tests)

* plan de test <https://jmeter.apache.org/> `lifap5-jmeter-testplan.jmx`
* script de lancement  `./jmeter-test.sh`

```bash
Creating summariser <summary>
Created the tree successfully using ./lifap5-jmeter-testplan.jmx
Starting the test @ Tue Apr 02 14:39:29 CEST 2019 (1554208769052)
Waiting for possible Shutdown/StopTestNow/HeapDump/ThreadDump message on port 4445
summary +      1 in 00:00:01 =    1.1/s Avg:   462 Min:   462 Max:   462 Err:     0 (0.00%) Active: 15 Started: 15 Finished: 0
summary +   6573 in 00:00:30 =  218.6/s Avg:   338 Min:    49 Max:  2048 Err:    37 (0.56%) Active: 54 Started: 80 Finished: 26
summary +   4681 in 00:00:30 =  156.8/s Avg:   262 Min:    32 Max:  1205 Err:    24 (0.51%) Active: 39 Started: 80 Finished: 41
summary =  11255 in 00:01:01 =  185.0/s Avg:   307 Min:    32 Max:  2048 Err:    61 (0.54%)
summary +   4463 in 00:00:30 =  148.5/s Avg:   206 Min:    14 Max:  1404 Err:    16 (0.36%) Active: 13 Started: 80 Finished: 67
summary +    484 in 00:00:03 =  188.6/s Avg:    44 Min:     2 Max:   325 Err:     0 (0.00%) Active: 0 Started: 80 Finished: 80
summary =  16202 in 00:01:33 =  173.4/s Avg:   271 Min:     2 Max:  2048 Err:    77 (0.48%)
Tidying up ...    @ Tue Apr 02 14:41:02 CEST 2019 (1554208862638)
```

### Références

<https://octoperf.com/blog/2018/03/29/jmeter-tutorial/#random-behavior>

Déploiement du serveur / prod
=============================

Cette partie est pour déployer un reverse-proxy nginx devant le serveur node et mettre en place quelques outils de monitoring.

* Cible : <https://lifap5.univ-lyon1.fr:443>
* Connexion : voir [`connect-server-prod.sh`](./connect-server-prod.sh)

Au cas où :

```bash
sudo chown -R $USER:$(id -gn $USER) /home/ubuntu/.config
```

Vérification du filtrage
------------------------

Depuis une IP du campus

```bash
nmap -P0 -p22,80,443,8080,8443,27017-27019,3389,3000 lifap5.univ-lyon1.fr

Starting Nmap 7.60 ( https://nmap.org ) at 2019-04-04 14:06 CEST
Nmap scan report for lifap5.univ-lyon1.fr (192.168.74.8)
Host is up (0.00078s latency).

PORT      STATE    SERVICE
22/tcp    open     ssh
80/tcp    open     http
443/tcp   open     https
3000/tcp  filtered ppp
3389/tcp  closed   ms-wbt-server
8080/tcp  closed   http-proxy
8443/tcp  closed   https-alt
27017/tcp filtered mongod
27018/tcp filtered mongod
27019/tcp filtered mongod
```

Configuration spécifique (proxy svn)
------------------------------------

```bash
edit ~/.subversion/servers
> [global]
> http-proxy-host = proxy.univ-lyon1.fr
> http-proxy-port = 3128
```

Crontab pour remise à zéro de la base
-------------------------------------

Ajouter avec `crontab -e`

```bash
crontab -l

> 42 * * * * mongoimport --uri mongodb://localhost:27017/lifap5-backend --collection topics --drop --jsonArray --type json --file /home/ubuntu/lifap5-projet/mongodb/Projet-2019-topics.json
```

Front Nginx / TLS
-----------------

### Certificats

#### Certificat auto-signé

```bash
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

#### Certificat <https://letsencrypt.org/> avec `certbot`

* <https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca>
* <https://certbot.eff.org/lets-encrypt/ubuntubionic-other>
* <https://stackoverflow.com/questions/48078083/lets-encrypt-ssl-couldnt-start-by-error-eacces-permission-denied-open-et>

```bash
sudo addgroup nodecert
sudo adduser ubuntu nodecert
sudo adduser root nodecert

sudo chgrp -R nodecert /etc/letsencrypt/live
sudo chgrp -R nodecert /etc/letsencrypt/archive

sudo chmod 710 /etc/letsencrypt/live
sudo chmod 710 /etc/letsencrypt/archive

sudo chmod 640 /etc/letsencrypt/archive/lifap5.univ-lyon1.fr/privkey1.pem
```

#### Backup des certificats

* <https://community.letsencrypt.org/t/best-way-to-backup-letsencrypt-folder/21551/2>

```bash
tar zcvf /tmp/letsencrypt_backup_$(date +'%Y-%m-%d_%H%M').tar.gz /etc/letsencrypt
```

### Reverse proxy nginx

* Référence <https://docs.nginx.com/nginx/deployment-guides/node-js-load-balancing-nginx-plus/> (dont un benchmark de perf)
* <https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/>
* <https://serverfault.com/questions/768509/lets-encrypt-with-an-nginx-reverse-proxy>
* <https://medium.com/intrinsic/why-should-i-use-a-reverse-proxy-if-node-js-is-production-ready-5a079408b2ca>

### Configuration nginx TLS

* <https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-open-source/#prebuilt_ubuntu>
* Voir config <https://www.nginx.com/resource/conf/nodejs-basic.conf>

```bash
nginx -v
> nginx version: nginx/1.15.10

sudo adduser nginx nodecert

sudo nginx -T
```

* Voir la configuration dans [`production`](./production) sauvegardée avec le script `backup-nginx-conf.sh`
* Voir <https://cipherli.st/> et <https://www.ssi.gouv.fr/administration/guide/recommandations-de-securite-relatives-a-tls/> pour les bonnes pratiques SSL

Voir les résultats sur

* <https://www.ssllabs.com/ssltest/analyze.html?d=lifap5.univ-lyon1.fr>
* ou avec <https://testssl.sh/>

### Configuration nginx websocket

* <https://www.nginx.com/blog/websocket-nginx/>

```nginx
location /stream/ {
    include /etc/nginx/conf.d/proxy_set_header.inc;
    proxy_pass http://nodejs;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Visualisation de logs

* Pour la conversion de format <https://github.com/stockrt/nginx2goaccess>
* Outils de visu <https://goaccess.io/>

Scalabilité et performance
--------------------------

* <https://pm2.io/doc/en/runtime/overview/>
* `NODE_ENV=production` pour la production
* Mis dans le script `dev:prod` de `package.json`
* Mis dans le fichier `ecosystem.config.js`

### Lancer

```bash
pm2 start --env local
pm2 ls

┌─────────────┬────┬─────────┬─────────┬───────┬────────┬─────────┬────────┬──────┬───────────┬────────┬──────────┐
│ App name    │ id │ version │ mode    │ pid   │ status │ restart │ uptime │ cpu  │ mem       │ user   │ watching │
├─────────────┼────┼─────────┼─────────┼───────┼────────┼─────────┼────────┼──────┼───────────┼────────┼──────────┤
│ lifap5-prod │ 0  │ 1.0.2   │ cluster │ 13687 │ online │ 2       │ 2h     │ 0.4% │ 64.8 MB   │ ubuntu │ disabled │
│ lifap5-prod │ 1  │ 1.0.2   │ cluster │ 13700 │ online │ 2       │ 2h     │ 0.4% │ 63.8 MB   │ ubuntu │ disabled │
└─────────────┴────┴─────────┴─────────┴───────┴────────┴─────────┴────────┴──────┴───────────┴────────┴──────────┘

pm2 logs
pm2 monit
```

### Références

#### Introduction to Load Balancing Using Node.js

* <https://mazira.com/blog/introduction-load-balancing-nodejs>
* <https://mazira.com/blog/introduction-load-balancing-nodejs-2>

#### Une série de posts sur PM2 <https://pm2.io/doc/>

1. <https://www.acuriousanimal.com/2017/08/12/understanding-the-nodejs-cluster-module>
2. <https://www.acuriousanimal.com/2017/08/18/using-cluster-module-with-http-servers>
3. <https://www.acuriousanimal.com/2017/08/20/using-pm2-to-manage-cluster.html>
4. <https://www.acuriousanimal.com/2017/08/27/graceful-shutdown-node-processes>

### Cache pour mongoose

A priori, pas vraiment utile ici

* <https://www.npmjs.com/package/cachegoose>

Expertise extérieure
====================

Générales
---------

* Alternatives à express
    * <https://www.fastify.io/>
    * <https://hapijs.com/>
* Configuration ESLINT : séparer le guide de style du reste
    * <https://standardjs.com/>
    * <https://github.com/prettier/prettier>
* _foreign key_ mongo
    * <https://mongoosejs.com/docs/api.html#schematype_SchemaType-ref>
* Passer des promesses à async/await
    * Voir  <https://www.npmjs.com/package/express-promise-router>
* Dev avec container docker pour node :
    * partager un volume avec le container
    * <https://docs.docker.com/compose/compose-file/#volumes>

Chiffrage (tests unitaires inclus)
----------------------------------

* Setup tooling/esling : 2 j.h.
* Fonctionnel :
    * authentification : 1 j.h
    * crud post/topics : 2 j.h
* Montage/infra (mongo, nginx) : 3 j.h

Sur les tests
-------------

* Framework de tests
    * <https://jestjs.io/>
    * <https://www.npmjs.com/package/power-assert>
* Test _postman_ : plus haut niveau que unitaires : intégration
    * Définition du type de test : si "pas besoin de bouchon", alors c'est un test d'intégration
    * Si on ne sait pas comment tester, c'est que le génie logiciel est mal organisé

Génie logiciel
--------------

* Le contrôleur ne devrait pas dépendre de la couche de routage http
    * ne devrait donc pas avoir `(req, res, next)` en paramètre, juste le métier
    * typiquement, le métier est intestable au niveau unitaire
    * introduire une indirection entre la route express et le métier
* Pagination : "standard" pour une application pro


