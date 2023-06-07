# iAqualink-proxy
This is a proxy for the iAqualink API.

## How to use
```shell
$ docker run -d -p 8000:8000 dadaamater/iaqualink-proxy:latest
```

or 

```shell
$ docker-compose up -d
```

Then query the API at `http://localhost:8000/?email=<iAqualinkEmail>&password=<iAqualinkPassword>&sn=<deviceSerialNumber>`

## How to build
```shell
docker buildx build . --platform linux/amd64,linux/arm64,linux/arm/v7 --push -t dadaamater/iaqualink-proxy:latest
```