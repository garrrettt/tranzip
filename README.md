# Tranzip Beta (name was changed during creation of project)

# To run on Cloud9

1. In the terminal, run `./mongod`
2. Open a new terminal and run `node app`
3. Go to trapp-beta-intjpianist.c9users.io
4. To run the test suite, open a new terminal and run `mocha`

# To run locally (this project requires a local installation of MongoDB):

1. Download and unzip the file
2. In the terminal, `cd` into the folder
3. Run `npm install`
4. Run `node app`
5. Go to localhost:8080

# Important elements of Design for Front-end

1. Use of Sass CSS preprocesser (/public/css/main_style.scss)
2. Use of Bootstrap to make the site mobile-first
3. Use of Flexbox grid system

# Important elements of Development for Logic

1. Use of MongoDB and NodeJS
2. Use of modern hashing functions for authentication (/passport)
3. Creation of automated Test Suite (/test)

# NOTE:

Data is limited because only 3 buses are entered in the system out of around 70. This means that while the system's accuracy will not be very high in the actual world, all logic will still be functional for future release.