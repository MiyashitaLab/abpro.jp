'use strict';

var SPREAD_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwmcdpMOtpF9JD9FC1xoqx2lxnCRl-wPpjKUNFfI9N-SEgwdRE/exec';

window.addEventListener('load', function () {
  window.$vm = new Vue({
    replace: false,
    el: '#speakers',
    data: function () {
      return {
        speakers: {
          am: [],
          pm_01: [],
          pm_02: []
        },
        hasError: false
      };
    },
    created: function () {
      var self = this;
      Promise.all([
        fetch('./configs/speakers_am.json'),
        fetch('./configs/speakers_pm_01.json'),
        fetch('./configs/speakers_pm_02.json')
      ]).then(function (results) {
        return Promise.all(results.map(function (r) { return r.json() }));
      }).then(function (results) {
        return results.map(function (speakers) {
          return speakers.map(function (s) {
              s.twitter = s.twitter.replace(/^@/, '');
              s.twitterIcon =
                (s.twitter)
                  ? './assets/twitter/' + s.twitter + '.jpg'
                  // ? 'https://avatars.io/twitter/' + s.twitter
                  : 'data:image/svg+xml,' + encodeURIComponent(jdenticon.toSvg(sha512(s.name), 200));
              s.twitterURL =
                (s.twitter)
                  ? 'https://twitter.com/' + s.twitter
                  : '';
              return s;
            });
        });
      }).then(function (results) {
        self.speakers.am = results[0];
        self.speakers.pm_01 = results[1];
        self.speakers.pm_02 = results[2];
      });
      // var self = this;
      // fetch(SPREAD_SHEET_URL)
      //   .then(function (res) {
      //     if (res.ok) return res;
      //     else fetch('https://crossorigin.me/' + SPREAD_SHEET_URL);
      //   })
      //   .then(function (res) {
      //     if (res.ok) return res.json();
      //     else return Promise.reject(new Error('Spread Sheet Error.'));
      //   })
      //   .then(function (speakers) {
      //     return speakers.map(function (s) {
      //       s.twitter = s.twitter.replace(/^@/, '');
      //       s.twitterIcon =
      //         (s.twitter)
      //           ? ( !device.desktop() ? 'https://crossorigin.me/' : '') +
      //             'https://twitter.com/' +
      //             s.twitter + '/profile_image?size=bigger'
      //           : './assets/egg.png';
      //       s.twitterURL =
      //         (s.twitter)
      //           ? 'https://twitter.com/' + s.twitter
      //           : '#';
      //       return s;
      //     });
      //   })
      //   .then(function (speakers) {
      //     self.speakers = speakers;
      //   })
      //   .catch(function (err) {
      //     self.hasError = err;
      //     console.error(err.stakc || err);
      //   });
    }
  });
});
