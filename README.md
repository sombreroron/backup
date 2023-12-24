# Backup

## Project Structure

### Libs:

#### @data-access

Contains clients for external services

#### @utils

Contains common utilities

### Apps:

#### Site / Db

Mock apis with minimal implementation. Used as the export apis.

#### Backup

The main app. Contains the backup logic.

## Setup

1. Install dependencies - ``npm install``
2. Setup Project: 
   1. Build docker containers - ``docker-compose up -d``
   2. Start site api - ``nx serve site``
   3. Start db api - ``nx serve db``
   
    Alternatively, run ``npm run setup`` to run all the above commands.
3. Serve the application - ``nx serve backup``

## Running backup

Create a new backup job by sending a POST request to ``/backup`` with a body containing any ``userId`` and ``siteId``:

```bash
curl --location 'http://localhost:3000/backup' \
--header 'Content-Type: application/json' \
--data '{
    "userId": "658683afc91423af04d82152",
    "siteId": "658683afc91423af04d82153"
}'
```

Job status can be checked by sending a GET request to ``/backup/{jobId}``:

```bash
curl --location 'http://localhost:3000/backup/65880592573d64948ad94690'
```

### Implementation

* Job is created by sending a POST request to ``/backup`` and is immediately returned to the user. Job status is set to ``pending``.


* An UploadJobCreated event is triggered after job has been created.


* The UploadJobCreated event handler streams the data from the providers defined in the Provider module, creating a task for each. All tasks begin with a ``pending`` status.


* Data parts are uploaded in sequences of a predefined chunk size in order to avoid memory issues.


* When a data part is successfully uploaded, the task status is set to ``done``. If the upload fails, the task status is set to ``failed`` and the job status is set to ``failed``.


* When all tasks are completed, the job status is set to ``done`` and the job is finished.


* UpdatePartTask and UpdateTask events are used to notify the job of task status changes.


## Assumptions

### Download

* Export api streams data as a zip containing all data
* Export api supports defining chunk size
* Current solution downloads all chunks before proceeding to the upload. Should be optimized to stream chunks to the upload step.

### Upload

* Data storage supports multi part upload
* Data storage returns checksum of uploaded files
* Only upload part is implemented, upload completion is missing
* DB storage is used instead of a storage, in order to save time, same db is used for storage and backup metadata

## Tech Stack

* DB - Writes are infrequent and data is small, MongoDB should be sufficient with a potential to scale. At a large scale, a write optimized database such as Cassandra can be considered.
* Event Handler - Kafka is used as a message broker, chosen for its high throughput and fault tolerance.

## Not Implemented

### Retry mechanism

Easily implemented by re-running the job, skipping each step that was already completed and retrying steps that failed.

### Size limit

Can be implemented either by retrieving the size of the export before starting the backup, or by stopping the stream once the size limit is reached.

### Scheduler

Should preferably be implemented by an external cron job that runs every X minutes and checks for new jobs to run.

### Polling

Polling can be done by sending a GET request to ``/backup/{jobId}`` every X seconds and checking the status.
A better implementation would be to use long polling, server sent events or websockets which would allow the server to notify the client when the status changes.
