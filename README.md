# Camera Simulator

An interactive React app for learning how core camera settings affect exposure, zoom, and image quality. The simulator lets you adjust aperture, shutter speed, ISO, and focal length while watching a live sensor preview and a calculated image quality score update in real time.

## Features

- Aperture control displayed as an f-number.
- Shutter speed control from slow to fast exposures.
- ISO sensitivity control with simulated digital noise penalties.
- Focal length slider for zoom and magnification changes.
- Exposure meter that shows under-exposed, balanced, and over-exposed states.
- Live image preview with brightness, blur, zoom, and noise effects.
- Image quality score with explanations for noise, diffraction, lens softness, and exposure clipping.
- Reset button that restores the simulator to an optimal baseline.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React icons

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173/`.

## Available Scripts

```bash
npm run dev
```

Runs the app locally with hot reloading.

```bash
npm run build
```

Creates a production build in the `dist/` directory.

```bash
npm run preview
```

Serves the production build locally for testing.

## Project Structure

```text
camera-simulator/
|-- .github/workflows/deploy.yml  # GitHub Pages deployment workflow
|-- public/                       # Static public files
|-- src/
|   |-- App.jsx                   # Main simulator UI and camera calculations
|   |-- index.css                 # Tailwind setup and global styles
|   `-- main.jsx                  # React entry point
|-- index.html                    # Vite HTML entry
|-- tailwind.config.js            # Tailwind content configuration
`-- vite.config.js                # Vite configuration
```

## How It Works

The simulator calculates exposure from aperture, shutter speed, and ISO. It compares the result against a reference scene brightness, then uses that value to update the exposure meter and preview brightness.

The image quality score starts at 100 and applies penalties for common camera tradeoffs:

- Higher ISO adds noise.
- Very wide apertures can reduce edge sharpness.
- Very small apertures can introduce diffraction blur.
- Strong under-exposure or over-exposure can clip image detail.

## Deployment

This project includes a GitHub Actions workflow for GitHub Pages deployment. On every push to the `main` branch, the workflow installs dependencies, builds the Vite app, uploads the `dist/` artifact, and deploys it to GitHub Pages.

The Vite base path is configured as:

```js
base: '/camera_simulator/'
```

If the repository name or Pages path changes, update `base` in `vite.config.js` before deploying.
