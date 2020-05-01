# README

#### INTRODUCTION

This is the backend application. Connect to it via REST api.

#### APPLICATION LOGS

* Storing application logs in `logs/app.log` file, which is accessible via `http://{host}/logs` route.

#### MONGO_URI

* Set this as env variable in heroku. Don't mention it in code, script or github. I repeat <b>NEVER mention it in code, script or github.</b>

#### TODO / THINGS TO KEEP IN MIND

* Add Design in the README.
* Connection to Back End REST APIs need to `authenticated` properly.
* Use Logging service in order to store application logs instead of local files.
* Write Unit tests.
* Write Integration tests.