const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');

// Sample data
let mediaData = {
  movies: [
    { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010 },
    { id: 2, title: 'The Shawshank Redemption', director: 'Frank Darabont', year: 1994 },
    { id: 3, title: 'Pulp Fiction', director: 'Quentin Tarantino', year: 1994 }
  ],
  series: [
    { id: 1, title: 'Breaking Bad', creator: 'Vince Gilligan', seasons: 5 },
    { id: 2, title: 'Game of Thrones', creator: 'David Benioff & D.B. Weiss', seasons: 8 },
    { id: 3, title: 'Stranger Things', creator: 'The Duffer Brothers', seasons: 4 }
  ],
  songs: [
    { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', year: 1975 },
    { id: 2, title: 'Imagine', artist: 'John Lennon', year: 1971 },
    { id: 3, title: 'Like a Rolling Stone', artist: 'Bob Dylan', year: 1965 }
  ]
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toUpperCase();
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    let chosenHandler = router[trimmedPath] || handlers.notFound;
    let data = {
      trimmedPath,
      method,
      payload: buffer ? JSON.parse(buffer) : {}
    };

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(JSON.stringify(payload));
    });
  });
});

const handlers = {};

// Movies handler
handlers.movies = (data, callback) => {
  const acceptableMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._movies[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._movies = {};

// GET movies
handlers._movies.GET = (data, callback) => {
  callback(200, mediaData.movies);
};

// POST movie
handlers._movies.POST = (data, callback) => {
  const newMovie = data.payload;
  if (newMovie.title && newMovie.director && newMovie.year) {
    newMovie.id = mediaData.movies.length + 1;
    mediaData.movies.push(newMovie);
    callback(201, mediaData.movies);
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// PUT movie
handlers._movies.PUT = (data, callback) => {
  const updatedMovie = data.payload;
  if (updatedMovie.id) {
    const index = mediaData.movies.findIndex(movie => movie.id === updatedMovie.id);
    if (index !== -1) {
      mediaData.movies[index] = { ...mediaData.movies[index], ...updatedMovie };
      callback(200, mediaData.movies);
    } else {
      callback(404, { error: 'Movie not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// DELETE movie
handlers._movies.DELETE = (data, callback) => {
  const id = data.payload.id;
  if (id) {
    const index = mediaData.movies.findIndex(movie => movie.id === id);
    if (index !== -1) {
      mediaData.movies.splice(index, 1);
      callback(200, mediaData.movies);
    } else {
      callback(404, { error: 'Movie not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// Series handler
handlers.series = (data, callback) => {
  const acceptableMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._series[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._series = {};

// GET series
handlers._series.GET = (data, callback) => {
  callback(200, mediaData.series);
};

// POST series
handlers._series.POST = (data, callback) => {
  const newSeries = data.payload;
  if (newSeries.title && newSeries.creator && newSeries.seasons) {
    newSeries.id = mediaData.series.length + 1;
    mediaData.series.push(newSeries);
    callback(201, mediaData.series);
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// PUT series
handlers._series.PUT = (data, callback) => {
  const updatedSeries = data.payload;
  if (updatedSeries.id) {
    const index = mediaData.series.findIndex(series => series.id === updatedSeries.id);
    if (index !== -1) {
      mediaData.series[index] = { ...mediaData.series[index], ...updatedSeries };
      callback(200, mediaData.series);
    } else {
      callback(404, { error: 'Series not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// DELETE series
handlers._series.DELETE = (data, callback) => {
  const id = data.payload.id;
  if (id) {
    const index = mediaData.series.findIndex(series => series.id === id);
    if (index !== -1) {
      mediaData.series.splice(index, 1);
      callback(200, mediaData.series);
    } else {
      callback(404, { error: 'Series not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// Songs handler
handlers.songs = (data, callback) => {
  const acceptableMethods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._songs[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._songs = {};

// GET songs
handlers._songs.GET = (data, callback) => {
  callback(200, mediaData.songs);
};

// POST song
handlers._songs.POST = (data, callback) => {
  const newSong = data.payload;
  if (newSong.title && newSong.artist && newSong.year) {
    newSong.id = mediaData.songs.length + 1;
    mediaData.songs.push(newSong);
    callback(201, mediaData.songs);
  } else {
    callback(400, { error: 'Missing required fields' });
  }
};

// PUT song
handlers._songs.PUT = (data, callback) => {
  const updatedSong = data.payload;
  if (updatedSong.id) {
    const index = mediaData.songs.findIndex(song => song.id === updatedSong.id);
    if (index !== -1) {
      mediaData.songs[index] = { ...mediaData.songs[index], ...updatedSong };
      callback(200, mediaData.songs);
    } else {
      callback(404, { error: 'Song not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// DELETE song
handlers._songs.DELETE = (data, callback) => {
  const id = data.payload.id;
  if (id) {
    const index = mediaData.songs.findIndex(song => song.id === id);
    if (index !== -1) {
      mediaData.songs.splice(index, 1);
      callback(200, mediaData.songs);
    } else {
      callback(404, { error: 'Song not found' });
    }
  } else {
    callback(400, { error: 'ID is required' });
  }
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404, { error: 'Route not found' });
};

const router = {
  'movies': handlers.movies,
  'series': handlers.series,
  'songs': handlers.songs
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});