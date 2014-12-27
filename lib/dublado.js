'use strict';

/*
* We import our depedencies
*/
var App = require('pdk'),
    _ = require('underscore'),
    helpers = require('./helper-querytorrent'),
    querystring = require('querystring'),
    kickass = require('kickass-torrent'),
    apiUrl = 'http://kickass.to/dailydump.txt.gz',
    //fingerprint = 'ED:10:DE:CD:19:37:65:7B:FE:71:FC:CB:E3:68:5C:AB:EE:66:01:D0',
    mirror = 'http://kickass.to/dailydump.txt.gz';

/*
* We build and export our new package
*/
var yts = App.Providers.Source.extend({

    /*
    * Package config
    * as we extend from Providers, we need
    * to set detail for the source.
    */
    config: {
        uniqueId: 'imdb_id',
        tabName: 'Dublados',
        type: 'movie', /* should be removed */
        subtitle: 'ysubs',
        metadata: 'trakttv:movie-metadata'
    },

    filters: {
        genres: [
            'All',
            'Action',
            'Adventure',
            'Animation',
            'Biography',
            'Comedy',
            'Crime',
            'Documentary',
            'Drama',
            'Family',
            'Fantasy',
            'Film-Noir',
            'History',
            'Horror',
            'Music',
            'Musical',
            'Mystery',
            'Romance',
            'Sci-Fi',
            'Short',
            'Sport',
            'Thriller',
            'War',
            'Western'
        ],
        sorters: [
            'popularity',
            'date',
            'year',
            'rating',
            'alphabet'
        ],
        types: []
    },

    onActivate: function() {

        // we'll check which domain we can use...
        this.checkSSL(apiUrl, fingerprint)
          .then (function () {
            console.log('SSL OK - using ' + apiUrl);
          })
          .catch(function (error) {
            apiUrl = mirror;
            console.log('SSL NOT OK - using ' + apiUrl);
          })
    },

    /*
    * Default Function used by PT
    */
    fetch: function (filters) {

        var params = {};
        params.sort = 'seeds';
        params.limit = '50';

        if (filters.keywords) {
            params.keywords = filters.keywords.replace(/\s/g, '% ')+"+category:movies+lang_id:17";
        }else {
            params.keywords = "category:movies+lang_id:17";
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.order) {
            var order = 'desc';
            if (filters.order === 1) {
                order = 'asc';
            }
            params.order = order;
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            params.sort = filters.sorter;
        }

        if (filters.page) {
            params.set = filters.page;
        } else {
            params.set = 1;
        }
        return;
        kickass({
            q: params.keywords,//actual search term
            field:'',//seeders, leechers, time_add, files_count, empty for best match
            page: params.set,
            order: params.order,//asc or desc
            url: 'http://kickass.to',//changes site default url (http://kickass.to)
        },function(e, data){
            return helpers.formatForPopcorn(data.list || {}, params)
        })
    },

    /*
    * Default Function used by PT
    */
    detail: function (torrent_id, old_data) {
        var params = {
            imdb_id: torrent_id
        };

        var url = apiUrl + 'listimdb.json?' + querystring.stringify(params).replace(/%E2%80%99/g, '%27');

        return this.request(url)
            .then(function(data) {
                var ptt = helpers.formatForPopcorn(data.MovieList || []);
                var torrents = ptt.results.pop().torrents || {};
                old_data.torrents = _.extend(old_data.torrents, torrents);

                return old_data;
            });
    }

});

module.exports = App.Core.extend({
    onActivate: function() {
        // register our new provider as a source
        this.register(yts);
    }
});
