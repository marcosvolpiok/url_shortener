# Build
```
docker-compose build
```

# Run

```
docker-compose down
docker-compose up
```

# Tests
You can run tests with need to enter to the backend's container shell:
```
docker exec -i -t url_shortener_backend_1 /bin/sh
```

Then run:
```
yarn test
```

# Postman
You can look a Postman collection on ./postman directory.