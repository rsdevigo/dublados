var helpers = {},
    _ = require('underscore'),
    dom = require('dom-extractor');
/*
* Format the items to be redeable by PT
*/
helpers.formatForPopcorn = function(items) {
    var results = {};
    var movieFetch = {};
    movieFetch.results = [];
    movieFetch.hasMore = (Number(items.length) > 1 ? true : false);
    _.each(items, function(movie) {
        // Aqui chama o dom extractor
        dom.fetch(movie.link, "div.dataList", function(movieData){
            var largeCover = "https://yuq.me/movies/21/032/2103281.jpg";
            var imdb = '2103281';

            // Calc torrent health
            var seeds = movie.seeds;
            var peers = movie.peers;

            var torrents = {};
            torrents["1080p"] = {
                url: movie.torrentLink,
                size: movie.size,
                filesize: (int)(movie.size)*1073741824,
                seed: seeds,
                peer: peers
            };

            var ptItem = results[imdb];
            if (!ptItem) {
                ptItem = {
                    imdb_id: imdb,
                    title: movie.title,
                    year: "2014",
                    genre: "Ação",
                    rating: "10",
                    image: largeCover,
                    torrents: torrents,
                    type: 'movie'
                };

                movieFetch.results.push(ptItem);
            } else {
                _.extend(ptItem.torrents, torrents);
            }

            results[imdb] = ptItem;
        });
        
    });

    return movieFetch;
};

module.exports = helpers;