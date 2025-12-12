# exam

## inicioti front ir admin

pirma ieikite i front ir poto git i kad instaliuoti visas dependencies

```
cd front
npm i
```

po to iniciokite admin

```
cd .. (tik jeigu esate vis dar front)
cd admin
npm i
```

ir API

```
cd ..
cd api
npm i
```

## docker

kai esate pagrindiniame folderyje (root) parasykite

```
docker compose up
```

## duomenu baze

kad sugeneruoti lanteles su Prisma pirma nueikite i api folderi
arba tesiog naudokite paprasta mySQL

```
cd api
```

ir po to panaudoti

```
npx prisma migrate dev --name init
npx prisma generate
```

reikia naudoti `npx prisma migrate dev --name init` kekviena karta kai pakeiciat schema.prisma iš api/prismamigrations
