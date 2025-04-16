import fetch from 'node-fetch';
import Movie from '../models/Example.js';
let movie, watchedMovies, totalMovies, totalTimesWatched, totalBoxOffice, sortCriteria = {};

export const home = async (req, res) => {
  await aggregateMoviesData();
  if (!watchedMovies) watchedMovies = await Movie.find();
  else watchedMovies = await Movie.find().sort(sortCriteria);
  
  //removev decimals
  const formattedBoxOffice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalBoxOffice);

  res.render('index', { 
    title: 'Home', 
    movie, 
    watchedMovies, 
    totalMovies, 
    totalTimesWatched, 
    totalBoxOffice: formattedBoxOffice 
  });
};

export const lookup = async (req, res) => {
  console.log(req.body);
  const key = process.env.MOVIE_KEY;
  const movieTitle = req.body.movieTitle || req.query.title;
  const url = `http://www.omdbapi.com/?t=${movieTitle}&apikey=${key}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    movie = await response.json();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while fetching data');
  }
};

export const watch = async (req, res) => {
  const { title, poster, director, year, boxOffice } = req.body;

  try {
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    } else {
      movie = new Movie({
        title,
        poster,
        director,
        year,
        boxOffice,
        timesWatched: 1
      });
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const watchAgain = async (req, res) => {
  const movieId = req.body.movieId;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing request');
  }
};

export const deleteMovie = async (req, res) => {
  const movieId = req.body.movieId;
  try {
    const movie = await Movie.findByIdAndDelete(movieId);
    if (movie) {
      req.flash('success', `Deleted movie: ${movie.title}`);
    } else {
      req.flash('error', 'Movie not found.');
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting movie');
    res.redirect('/');
  }
};

export const sortMovies = async (req, res) => {
  switch (req.query.by) {
    case 'name':
      sortCriteria = { title: 1 };
      break;
    case 'watched':
      sortCriteria = { timesWatched: -1 };
      break;
    case 'rating':
      sortCriteria = { rating: -1 }; 
      break;
    default:
      break;
  }
  res.redirect('/');
};

export const displayMovie = async (req, res) => {
  const movieTitle = req.query.title;
  console.log(movieTitle);
  movie = await Movie.find({title: movieTitle});
  res.redirect('/');
};

const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $addFields: {
          cleanedBoxOffice: {
            $cond: [
              { $eq: [ { $substrCP: ["$boxOffice", 0, 1] }, { $literal: "$" } ] },
              {
                $substrCP: [
                  "$boxOffice",
                  1,
                  { $subtract: [ { $strLenCP: "$boxOffice" }, 1 ] }
                ]
              },
              "$boxOffice"
            ]
          }
        }
      },
      {
        $addFields: {
          numericBoxOffice: {
            $cond: [
              {
                $and: [
                  { $ne: ["$cleanedBoxOffice", "N/A"] },
                  { $ne: ["$cleanedBoxOffice", null] }
                ]
              },
              {
                $toDouble: {
                  $replaceAll: {
                    input: "$cleanedBoxOffice",
                    find: ",",
                    replacement: ""
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          totalTimesWatched: { $sum: "$timesWatched" },
          totalBoxOffice: { $sum: "$numericBoxOffice" }
        }
      }
    ]);

    if (result.length > 0) {
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      totalBoxOffice = result[0].totalBoxOffice;
      console.log(
        `Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}, Total Box Office: ${totalBoxOffice}`
      );
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};

export const rateMovie = async (req, res) => {
  const { movieId, rating } = req.body;
  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.rating = rating;
      await movie.save();
      req.flash('success', `Rated ${movie.title} ⭐ ${rating}/5`);
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error processing rating');
    res.redirect('/');
  }
};