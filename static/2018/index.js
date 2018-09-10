window.addEventListener('load', function() {
  var amList = [
    {
      url: 'https://twitter.com/kzk_ponkotu',
      thumbnail: './assets/img/Y1eIMhy-_400x400.jpg',
      name: '木崎駿也',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/de_kyuu',
      thumbnail: './assets/img/S0fBq4st_400x400.png',
      name: 'バーチャルできゅうばー',
      affiliation: '宮下研OB',
    },
    {
      url: 'https://twitter.com/tagryo_m',
      thumbnail: './assets/img/QiY0zrwM_400x400.jpg',
      name: '田口諒',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/doi10070511',
      thumbnail: './assets/img/SddDH_BL_400x400.jpg',
      name: '土居侑希子',
      affiliation: '渡邊研究室',
    },
    {
      url: 'https://twitter.com/kkkkkkkkkk024',
      thumbnail: './assets/img/G9TM6wbz_400x400.png',
      name: '立川雄志',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/fms_pilkul',
      thumbnail: './assets/img/IUemAzjb_400x400.jpg',
      name: '樋渡祥平',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/qurihara',
      thumbnail: './assets/img/e2YjRaT-_400x400.jpg',
      name: '栗原一貴',
      affiliation: '津田塾大学',
    },
    {
      url: 'https://twitter.com/ryunryunryun_',
      thumbnail: './assets/img/9jJdoxMl_400x400.jpg',
      name: '藤原瑠',
      affiliation: '現象数理学科',
    },
    {
      url: 'https://twitter.com/rain_fms',
      thumbnail: './assets/img/9a3dAGLD_400x400.jpg',
      name: '雨',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/mayumi_kt2',
      thumbnail: './assets/img/OmF5MtVK_400x400.jpg',
      name: '中西真弓',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/rgbten084',
      thumbnail: './assets/img/QSpVpJ_J_400x400.jpg',
      name: '藏地健志',
      affiliation: '株式会社ソノリテ',
    },
    {
      url: 'https://twitter.com/FMS_Cat',
      thumbnail: './assets/img/xzkUbckz_400x400.jpg',
      name: '小渕豊',
      affiliation: '株式会社イマジカデジタルスケープ',
    },
  ];

  var pmList = [
    {
      url: 'https://twitter.com/HomeiMiyashita',
      thumbnail: './assets/img/MX0HRTn_400x400.jpg',
      name: '宮下芳明',
      affiliation: '明治大学',
    },
    {
      url: 'https://twitter.com/HZawa_works',
      thumbnail: './assets/img/6bNN_erP_400x400.jpg',
      name: '相澤裕貴',
      affiliation: '明治大学 渡邊研究室',
    },
    {
      url: 'https://twitter.com/kaitofl',
      thumbnail: './assets/img/P8AWHcRm_400x400.jpg',
      name: '山田開斗',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/snowdome_e',
      thumbnail: './assets/img/190764e83de9c8566cdce7d39458daf4_400x400.jpeg',
      name: '土井麻由佳',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/tnayuki',
      thumbnail: './assets/img/450376157_243_400x400.jpg',
      name: 'tnayuki',
      affiliation: '',
    },
    {
      url: 'https://twitter.com/ukeyshima',
      thumbnail: './assets/img/5cGmSyiB_400x400.jpg',
      name: '島田雄輝',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/kasanetarium',
      thumbnail: './assets/img/10TtXRgP_400x400.jpg',
      name: '堀洋祐',
      affiliation: 'カサネタリウム',
    },
    {
      url: 'https://twitter.com/stamefusa',
      thumbnail: './assets/img/6B0CRhSB_400x400.jpg',
      name: '爲房新太朗',
      affiliation: 'デイリーポータルZ',
    },
    {
      url: 'https://twitter.com/saraha_fms',
      thumbnail: './assets/img/w5IDishF_400x400.jpg',
      name: '上野新葉',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/mayoneko_fms',
      thumbnail: './assets/img/J8xPxjWt_400x400.jpg',
      name: '真夜猫',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/kazuaha63',
      thumbnail: './assets/img/0ec31abc69bcdb68a2781b16ecb5f19c_400x400.jpeg',
      name: '阿原一志',
      affiliation: 'FMS',
    },
    {
      url: 'https://twitter.com/yoh7686',
      thumbnail: './assets/img/edKGsnd5_400x400.jpg',
      name: '簗瀬洋平',
      affiliation: 'ユニティ・テクノロジーズ・ジャパン合同会社',
    },
    {
      url: 'https://twitter.com/solt9029',
      thumbnail: './assets/img/xnfes8i_400x400.jpg',
      name: '塩出研史',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/frog_aboon',
      thumbnail: './assets/img/tGy9Rs17_400x400.jpg',
      name: '大場直史',
      affiliation: '宮下研究室',
    },
    {
      url: 'https://twitter.com/3846masa',
      thumbnail: './assets/img/WaI-X5Jx_400x400.jpg',
      name: '宮代理弘',
      affiliation: '宮下研究室',
    },
  ];

  generateTimeTable('.js-timetable-am', amList);
  generateTimeTable('.js-timetable-pm', pmList);
});

/**
 * @param {string} selector
 * @param {*[]} list
 */
function generateTimeTable(selector, list) {
  var $template = document.querySelector(selector);
  for (var idx = 0; idx < list.length; idx++) {
    var presenter = list[idx];
    var $image = $template.content.querySelector('.js-image');
    var $name = $template.content.querySelector('.js-name');
    var $affiliation = $template.content.querySelector('.js-affiliation');

    $image.setAttribute('src', presenter.thumbnail);
    $image.setAttribute('alt', presenter.name);
    $name.setAttribute('href', presenter.url);
    $name.textContent = String(idx + 1) + '.\x20' + presenter.name;
    $affiliation.textContent = presenter.affiliation;

    var $clone = document.importNode($template.content, true);
    $template.parentElement.appendChild($clone);
  }
}
