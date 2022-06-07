# Welcome to Digitögg!

## Set up project (only once)
1. Make sure [nodejs](https://nodejs.org) and [pnpm](https://pnpm.io/) (the best & fastest node dependency manager) is installed on your system (if you want to use npm or yarn, you have to change the scripts in the package.json accordingly).
2. Create a `.env` file in the root directory according to the `.example.env` file. (you can also just replace the contents and rename it to .env once you're done).
3. Run `pnpm install`.
4. Run `pnpx prisma generate`. This creates the database at the specified URL in the `.env` File.

## Run project
To run the project locally, just run `pnpm run dev`
