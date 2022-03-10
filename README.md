
# Live Stream App
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project is an in-browser live streaming app built for the talk "Democratizing Live Video with React" based off of the Mux blog post, 
[The state of going live from a browser](https://mux.com/blog/the-state-of-going-live-from-a-browser/).

![live-stream-app](https://user-images.githubusercontent.com/12901850/157758507-e2a61889-dc7e-460b-a726-e15bf32cc932.gif)

## Getting Started

First, fork or clone this repo. To run it, first install all dependencies from the `package.json` file:
```bash
npm install
```

Then, run the development build of the application:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

To run the production version of the application:

Build the app:
```bash
npm run build
```

Then start the app:
```bash
npm run start
```
To use the application to stream, you'll need to create a [Mux](https://mux.com) account, create a new Live Stream, and use the Stream Key provided in your application.
