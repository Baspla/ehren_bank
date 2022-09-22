# Plan
Der Plan ist:
Anwendungen (z.B. Quill&Dagger, Ivona, Signal) können einem Nutzer anhand seiner SecretUniqueSnowflake (kurz: sus) Ehre geben und nehmen.
Die Aufrufe werden über eine REST API getätigt, welche für eine Anwendung einen API-Token erfordert.
Die Provisionierung von App und User Accounts findet über ein Client-Secret statt.

*RFC 6902 wird ignoriert.*

## REST API
Alle Antworten sind im Format `{"code": 123, "method":"getThis" (, "response":...) (, "error":"Oops!")}`

### ADMIN
Diese Aufrufe benötigen den Header `"Authorization: Secret 1234567890abcdef"`

**GET** /v1/user/{sus}

> Siehe unten. Akzeptiert beide Header

**GET** /v1/app/{appid}

> Gibt die App im Format `{"apiToken":"string","name":"string"}` zurück.

**POST** /v1/user

> Fügt einen Nutzer über `{"sus":"braveShark","name":"Bob","balance":0}` hinzu.

**POST** /v1/app

> Fügt eine App über `{"appId":"signal","name":"Signal"}` hinzu.

**DELETE** /v1/user/{sus}

> Löscht den Nutzer.

**DELETE** /v1/app/{appid}

> Löscht einen App Eintrag.

### APP
Diese Aufrufe benötigen den Header `"Authorization: Apikey appName:1234567890abcdef"`

**GET** /v1/user/{sus}

> Gibt den Nutzer im Format `{"balance":"int","name":"string"}` zurück.

**GET** /v1/user

> Gibt eine Liste von allen Nutzern im Format `{"users":[{"sus":"sus1","balance":1},{"sus":"sus2","balance":2},,...]}` zurück.

**GET** /v1/user?inverted=true&n=6

> Gibt eine sortierte Liste an Nutzern im Format `{"users":[{"sus":"sus2","balance":200},{"sus":"sus1","balance":5},...]}` zurück. Ist der Query `inverted` gegeben wird die Liste invertiert. Ist der Query `n` gegeben wird die Liste beschränkt.

**PATCH** /v1/user/{sus}

> Ändern der Balance über `{"increment":int}` oder `{"decrement":int}`. Math.abs() für alle ints.

## Interne Redis Befehle
ZADD balance 0 user:snowflake

ZRANGE balance 0 -1

HSET user:snowflake name "BOB"

HSET app:signal apiToken "ABCXYZ" name "Signal"