# Fabric backend challenge

Welcome to the Fabric backend challenge! This project uses the following technologies:

- **NestJS** for the main application
- **MongoDB** database for storage
- **Redis** with **BullMQ** for message queue handling

## Quick demo

To quickly demo the application, run the following command to spin up all necessary containers:

```bash
$ docker compose up
```

If your Docker Desktop still uses Docker Compose V1, use:

```bash
$ docker-compose up
```

## Endpoints

Once the containers are up, you can interact with the API using the following endpoints.

#### Create Patient:

```bash
$ curl -X POST http://localhost:3000/api/v1/patients \
-H "Content-Type: application/json" \
-d '{"name": "John Doe", "age": 30, "gender": "Male", "contact":"555-1234" }'
```

#### Get All Patients:

```bash
$ curl http://localhost:3000/api/v1/patients
```

#### Get a single patient:

```bash
$ curl http://localhost:3000/api/v1/patients/1
```

#### Post appointments file:

```bash
$ curl -X POST http://localhost:3000/api/v1/appointments \
-H "Content-Type: application/json" \
-d '{"filepath": "~/documents/file.csv" }'
```

#### Get all appointments:

```bash
$ curl http://localhost:3000/api/v1/appointments
```

#### Get appointments with a specific patient_id:

```bash
$ curl "http://localhost:3000/api/v1/appointments?patient_id=101"
```

#### Get appointments with a specific doctor:

```bash
$ curl "http://localhost:3000/api/v1/appointments?doctor=Dr.%20Johnson"
```

#### Get single appointment:

```bash
$ curl http://localhost:3000/api/v1/appointments/1
```

## Local project setup

#### Install dependencies

```bash
$ npm install
```

#### Compile and run the project

To configure the project to connect to the MongoDB and Redis containers, rename the .env.example file to .env.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

You can run tests to ensure the application is working as expected.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Observations

- The POST request to /appointments initially contained a _200 OK_ status code on page 3 and _201 Created_ on page 4. I chose to use _201 Created_ as it better conveys the action of creating a new resource.

## Requirements

`/patients` Endpoint
● POST request to /patients:
○ Creates a new patient record. ✅
○ Expects a JSON patient object without an id property as a body payload. ✅
○ Adds the patient object to the collection and assigns a unique integer id. ✅
○ Responds with the created patient object and a 201 status code. ✅
● GET request to /patients:
○ Returns a collection of all patient records. ✅
○ Responds with an array of patient objects and a 200 status code. ✅
● GET request to /patients/:id:
○ Returns a patient record with the given id. ✅
○ Responds with the patient object and a 200 status code if found. ✅
○ Responds with a 404 status code if no patient is found. ✅

`/appointments` Endpoint
● GET request to /appointments:
○ Returns a collection of all appointments. ✅
○ Responds with an array of appointment objects and a 200 status code. ✅
○ Optionally accepts query parameters patient_id and doctor. ✅
● GET request to /appointments/:id:
○ Returns an appointment with the given id. ✅
○ Responds with the appointment object and a 200 status code if found. ✅
○ Responds with a 404 status code if no appointment is found. ✅
● POST request to /appointments
○ Creates an event to process a file containing appointments. ✅
○ Expect a file path parameter in the request body (can be a local file path). ✅
○ Responds with a 200 status code once the event is successfully published to the broker. ✅

`Appointments Queue`
○ Processes a CSV file and inserts appointments into the database. ✅
