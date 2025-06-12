# anonasong

anonasong is a small web experiment that lets people leave songs and short notes anonymously for a name. Each name has a "garden" where songs appear as flowers. It is entirely client side and stores data in the browser using `localStorage`.

## Features

- Search for a name to view its garden
- Plant a song (Spotify or YouTube link, or just text) with an optional note
- Browse a random garden
- Admin interface to review all flowers and manage a simple spam filter

## Running Locally

Because the project relies on browser storage, it should be served from a local web server rather than opened directly from the file system. Any static server will do. For example using Python:

```bash
python3 -m http.server
```

Then open [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.

All data is saved in your own browser only. Clearing your browser's storage will remove any gardens you've created.

## Development

The site consists of plain HTML, CSS and JavaScript. No build step is required. Feel free to modify the files and refresh the browser to see changes.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
