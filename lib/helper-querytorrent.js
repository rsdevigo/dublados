var helpers = {},
    _ = require('underscore'),
    dom = require("htmlparser2"),
    cheerio = require("cheerio"),
    qu = require("q"),
    fetchUrl = require("fetch").fetchUrl,
    unidecode = require('unidecode');
/*
* Format the items to be redeable by PT
*/
helpers.formatForPopcorn = function(items) {
    var results = {};
    var movieFetch = {};
    movieFetch.results = [];
    movieFetch.hasMore = (Number(items.length) > 1 ? true : false);
    var dfd = qu.defer();
    var promise;
 
    dfd.resolve();
    promise = dfd.promise;
    _.each(items, function(movie) {
        promise = promise.then(function() {
            return helpers.getInfo(movie.link);
        }).then(function(info) {
           if (!_.isEmpty(info) && (info.quality == "720p" || info.quality == "1080p" || info.quality == "HDRiP")) {
              var largeCover = "";
              var imdb = info.imdb;
      
              // Calc torrent health
              var seeds = movie.seeds;
              var peers = movie.peers;
      
              var torrents = {};
              size = movie.size/1073741824
              size = size.toFixed(2)
              torrents[info.quality] = {
                  url: movie.torrentLink,
                  size: movie.size,
                  filesize: size + ' GB',
                  seed: seeds,
                  peer: peers
              };
              
              var ptItem = results[imdb];
              if (!ptItem) {
                  ptItem = {
                      imdb_id: imdb,
                      title: info.title,
                      year: info.year,
                      genre: info.genre,
                      rating: info.rating,
                      image: largeCover,
                      torrents: torrents,
                      type: 'movie'
                  };
                  
                  movieFetch.results.push(ptItem);
              } else {
                  _.extend(ptItem.torrents, torrents);
              }
              results[imdb] = ptItem;
            }
        });
    })
    return promise.then(function() {
        //console.log(movieFetch)
        return movieFetch;
    });
};

helpers.getInfo = function(link) {
  var info = []
  var deferred = qu.defer();
  fetchUrl(unidecode(link), function(error, response, body){
    $ = cheerio.load(body.toString())
    $("div.dataList>ul").each(function(){
      $(this).children('li').each(function(){
        info.push($(this).text())
      })
    })
    deferred.resolve(helpers.parseInfo(info))
  })
  return deferred.promise
}

helpers.parseInfo = function(info) {
  if (info.length < 10) return {}
  t = info[0]?info[0]:""
  q = info[1]?info[1]:""
  i = info[2]?info[2]:""
  r = info[3]?info[3]:""
  g = info[5]?info[5]:""
  y = info[7]?info[7]:""
  
  t = t.replace("Movie:", "")
  t = t.trim()
  
  q = q.replace("Detected quality:","")
  q = q.trim()
  
  i = i.replace("IMDb link:","")
  i = i.trim()
  
  r = r.replace("IMDb rating:","")
  r = r.trim()
  
  g = g.replace("Genre:","")
  g = g.trim()
  
  g = g.replace("Genres:","")
  g = g.trim()
  
  y = y.replace("Release date:", "")
  y = y.trim()
  
  return {title: t, quality: q, imdb: i, rating: r, year: y, genre: g}
}

module.exports = helpers;