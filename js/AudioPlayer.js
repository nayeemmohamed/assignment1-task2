(function(window, undefined) {

'use strict';

var Audiomusicplayer = (function() {

    var htmlInJs =
    '<span style="color:gray"><b>&emsp;Description:</b><span> <i><b><span class="app-description" style="color:black;font-family:Arial;"></span></b></i>'+
    '  <div class="ap-inner">'+
    '    <div class="ap-panel" style="margin-top:10px;">'+
    '      <div class="ap-item ap--playback">'+
    '        <button class="ap-controls ap-prev-btn">'+
    '          <i class="material-icons md-dark">skip_previous</i>'+
    '        </button>'+
    '        <button class="ap-controls ap-toggle-btn">'+
    '            <i class="material-icons md-dark ap--play">play_arrow</i>'+
    '            <i class="material-icons md-dark ap--pause">pause</i>'+
    '        </button>'+
    '        <button class="ap-controls ap-next-btn">'+
    '          <i class="material-icons md-dark">skip_next</i>'+
    '        </button>'+
    '      </div>'+
    '      <div class="ap-item ap--track" style="">'+
    '        <div class="ap-info" style="margin-top:10px">'+
    '          <span class="app-artist" style="">Unknown</span> | <span class="ap-title"></span>'+
    '          <div class="ap-time">'+
    '            <span class="ap-time--current">--</span>'+
    '            <span> / </span>'+
    '            <span class="ap-time--duration">--</span>'+
    '          </div>'+
    ''+
    '          <div class="ap-progress-container">'+
    '            <div class="ap-progress">'+
    '              <div class="ap-bar"></div>'+
    '              <div class="ap-preload-bar"></div>'+
    '            </div>'+
    '          </div>'+
    ''+
    '        </div>'+
    '      </div>'+
    '      <div class="ap-item ap--byDefault">'+
    '        <div class="ap-controls ap-volume-container">'+
    '          <button class="ap-controls ap-volume-btn">'+
    '              <i class="material-icons md-dark ap--volume-on">volume_up</i>'+
    '              <i class="material-icons md-dark ap--volume-off">volume_mute</i>'+
    '          </button>'+
    '          <div class="ap-volume">'+
    '            <div class="ap-volume-progress"><div class="ap-volume-bar"></div></div>'+
    '          </div>'+
    '        </div>'+
    '        <button class="ap-controls ap-repeat-btn">'+
    '          <i class="material-icons md-dark">repeat</i>'+
    '        </button>'+
    '        <button class="ap-controls ap-playlist-btn">'+
    '          <i class="material-icons md-dark">queue_music</i>'+
    '        </button>'+
    '      </div>'+
    '    </div>'+
    '  </div>';


  // musicplayer vars
  var
  musicplayer,
  playMusic,
  btnPrevious,
  btnNext,
  pListBtn,
  repeatBtn,
  volButton,
  musicProgressBar,
  preLoadProgressBar,
  musicCurentTime,
  ComoleteMusicTime,
  SongTitle,
  MusicArtisit,
  trackDescription,
  audio,
  listIndex = 0,
  playList,
  volVerticalBar,
  volHeight,
  repeating = false,
  progressSeeking = false,
  rtOnClick = false,
  apActive = false,
  // playlist vars
  pl,
  plLi,
  // byDefault
  byDefault = {
    container: 'body',
    volume   : 0.5,
    autoPlay : false,
    notification: false,
    playList : []
  };



/**
 *  PlayList methods
 */
    function renderPL() {
      var html = [];
      var tpl =
        '<li data-track="{count}">'+
          '<div class="pl-number">'+
            '<div class="pl-count">'+
              '<i class="material-icons">audiotrack</i>'+
            '</div>'+
            '<div class="pl-playing">'+
              '<div class="eq">'+
                '<div class="eq-bar"></div>'+"="+
                '<div class="eq-bar"></div>'+"=>"+
                '<div class="eq-bar"></div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div class="pl-title">{title}</div>'+
          '<button class="pl-remove">'+
              '<i class="material-icons">delete</i>'+
          '</button>'+
        '</li>';

      playList.forEach(function(item, i) {
        html.push(
          tpl.replace('{count}', i).replace('{title}', item.title+'\tartist: '+item.artist)
        );
      });

      pl = generateHtmlElement('div', {
        'className': 'pl-container hide',
        'id': 'pl',
        'innerHTML': !isEmptyList() ? '<ul class="pl-list">' + html.join('') + '</ul>' : '<div class="pl-empty">PlayList is empty</div>'
      });

      musicplayer.parentNode.insertBefore(pl, musicplayer.nextSibling);

      plLi = pl.querySelectorAll('li');

      pl.addEventListener('click', listHandler, false);
    }


    function onInitialize(options) {

      if(!('classList' in document.documentElement)) {
        return false;
      }
  
      musicplayer = generateHtmlElement('div', {
        'className': 'new-ap',
        'id': 'new-ap',
        'innerHTML': htmlInJs
      });
  
      if(apActive || musicplayer === null) {
        return;
      }
  
      byDefault = JoinProperty(byDefault, options);
  
      document.querySelector(byDefault.container).insertBefore(musicplayer, null);
  
      // get musicplayer elements
      playMusic        = musicplayer.querySelector('.ap-toggle-btn');
      btnPrevious        = musicplayer.querySelector('.ap-prev-btn');
      btnNext        = musicplayer.querySelector('.ap-next-btn');
      repeatBtn      = musicplayer.querySelector('.ap-repeat-btn');
      volButton      = musicplayer.querySelector('.ap-volume-btn');
      pListBtn          = musicplayer.querySelector('.ap-playlist-btn');
      musicCurentTime        = musicplayer.querySelector('.ap-time--current');
      ComoleteMusicTime        = musicplayer.querySelector('.ap-time--duration');
      SongTitle     = musicplayer.querySelector('.ap-title');
      MusicArtisit    = musicplayer.querySelector('.app-artist');
      trackDescription =musicplayer.querySelector('.app-description');
      musicProgressBar    = musicplayer.querySelector('.ap-bar');
      preLoadProgressBar     = musicplayer.querySelector('.ap-preload-bar');
      volVerticalBar      = musicplayer.querySelector('.ap-volume-bar');
  
      playList = byDefault.playList;
  
      playMusic.addEventListener('click', togglePlayMusic, false);
      volButton.addEventListener('click', volumeToggle, false);
      repeatBtn.addEventListener('click', repeatToggle, false);
  
      musicProgressBar.parentNode.parentNode.addEventListener('mousedown', dragMoveMusicBar, false);
      musicProgressBar.parentNode.parentNode.addEventListener('mousemove', musicSeekLoad, false);
      document.documentElement.addEventListener('mouseup', progressSeekingFalse, false);
  
      volVerticalBar.parentNode.parentNode.addEventListener('mousedown', setVolumeBar, false);
      volVerticalBar.parentNode.parentNode.addEventListener('mousemove', setVolume);
      document.documentElement.addEventListener('mouseup', progressSeekingFalse, false);
  
      btnPrevious.addEventListener('click', prev, false);
      btnNext.addEventListener('click', next, false);
  
  
      apActive = true;
  
      // Create playlist
      renderPL();
      pListBtn.addEventListener('click', plToggle, false);
  
      // Create audio object
      audio = new Audio();
      audio.volume = byDefault.volume;
  
  
  
      if(isEmptyList()) {
        empty();
        return;
      }
  
      audio.src = playList[listIndex].file;
      audio.preload = 'auto';
      SongTitle.innerHTML = playList[listIndex].title;
      MusicArtisit.innerHTML = playList[listIndex].artist;
      trackDescription.innerHTML=playList[listIndex].description;
      volVerticalBar.style.height = audio.volume * 100 + '%';
      volHeight = volVerticalBar.css('height');
  
      audio.addEventListener('error', error, false);
      audio.addEventListener('timeupdate', update, false);
      audio.addEventListener('ended', doEnd, false);
  
      if(byDefault.autoPlay) {
        audio.play();
        playMusic.classList.add('playing');
        plLi[listIndex].classList.add('pl-current');
      }
    }




    function plActive() {
      if(audio.paused) {
        plLi[listIndex].classList.remove('pl-current');
        return;
      }
      var current = listIndex;
      for(var i = 0, len = plLi.length; len > i; i++) {
        plLi[i].classList.remove('pl-current');
      }
      plLi[current].classList.add('pl-current');
    }


/**
 *  musicplayer methods
 */
  function error() {
    !isEmptyList() && next();
  }
  function play() {

    listIndex = (listIndex > playList.length - 1) ? 0 : listIndex;
    if(listIndex < 0) listIndex = playList.length - 1;

    if(isEmptyList()) {
      empty();
      return;
    }

    audio.src = playList[listIndex].file;
    audio.preload = 'auto';
    document.title = SongTitle.innerHTML = playList[listIndex].title;
    MusicArtisit.innerHTML=playList[listIndex].artist;
    trackDescription.innerHTML=playList[listIndex].description;
    audio.play();
    showMesssage(playList[listIndex].title, {
      icon: playList[listIndex].icon,
      body: 'Now playing',
      tag: 'music-musicplayer',
      myArtisit: playList[listIndex].artist
    });
    playMusic.classList.add('playing');
    plActive();
  }


  function listHandler(evt) {
    evt.preventDefault();
    if(evt.target.className === 'pl-title') {
      var current = parseInt(evt.target.parentNode.getAttribute('data-track'), 10);
      listIndex = current;
      play();
      plActive();
    }
    else {
      var target = evt.target;
      while(target.className !== pl.className) {
        if(target.className === 'pl-remove') {
          var isDel = parseInt(target.parentNode.getAttribute('data-track'), 10);

          playList.splice(isDel, 1);
          target.parentNode.parentNode.removeChild(target.parentNode);

          plLi = pl.querySelectorAll('li');

          [].forEach.call(plLi, function(el, i) {
            el.setAttribute('data-track', i);
          });

          if(!audio.paused) {

            if(isDel === listIndex) {
              play();
            }

          }
          else {
            if(isEmptyList()) {
              empty();
            }
            else {
              // audio.currentTime = 0;
              audio.src = playList[listIndex].file;
              document.title = SongTitle.innerHTML = playList[listIndex].title;
              musicProgressBar.style.width = 0;
            }
          }
          if(isDel < listIndex) {
            listIndex--;
          }

          return;
        }
        target = target.parentNode;
      }

    }
  }

  
  

  function isEmptyList() {
    return playList.length === 0;
  }

  function empty() {
    audio.pause();
    audio.src = '';
    SongTitle.innerHTML = 'queue is empty';
    MusicArtisit.innerHTML='no any artist';
    trackDescription.innerHTML='no Description is available.'
    musicCurentTime.innerHTML = '--';
    ComoleteMusicTime.innerHTML = '--';
    musicProgressBar.style.width = 0;
    preLoadProgressBar.style.width = 0;
    playMusic.classList.remove('playing');
    pl.innerHTML = '<div class="pl-empty">PlayList is empty</div>';
  }

  function togglePlayMusic() {
    if(isEmptyList()) {
      return;
    }
    if(audio.paused) {
      audio.play();
      showMesssage(playList[listIndex].title, {
        icon: playList[listIndex].icon,
        body: 'Now playing',
        myArtisit: playList[listIndex].artist
      });
      this.classList.add('playing');
    }
    else {
      audio.pause();
      this.classList.remove('playing');
    }
    plActive();
  }


  function next() {
    listIndex = listIndex + 1;
    play();
  }

  function prev() {
    listIndex = listIndex - 1;
    play();
  }


 

  function repeatToggle() {
    var repeat = this.classList;
    if(repeat.contains('ap-active')) {
      repeating = false;
      repeat.remove('ap-active');
    }
    else {
      repeating = true;
      repeat.add('ap-active');
    }
  }

  function plToggle() {
    this.classList.toggle('ap-active');
    pl.classList.toggle('hide');
  }

  function update() {
    if(audio.readyState === 0) return;

    var barlength = Math.round(audio.currentTime * (100 / audio.duration));
    musicProgressBar.style.width = barlength + '%';

    var
    curMins = Math.floor(audio.currentTime / 60),
    curSecs = Math.floor(audio.currentTime - curMins * 60),
    mins = Math.floor(audio.duration / 60),
    secs = Math.floor(audio.duration - mins * 60);
    (curSecs < 10) && (curSecs = '0' + curSecs);
    (secs < 10) && (secs = '0' + secs);

    musicCurentTime.innerHTML = curMins + ':' + curSecs;
    ComoleteMusicTime.innerHTML = mins + ':' + secs;

    var buffered = audio.buffered;
    if(buffered.length) {
      var loaded = Math.round(100 * buffered.end(0) / audio.duration);
      preLoadProgressBar.style.width = loaded + '%';
    }
  }

  function doEnd() {
    if(listIndex === playList.length - 1) {
      if(!repeating) {
        audio.pause();
        plActive();
        playMusic.classList.remove('playing');
        return;
      }
      else {
        listIndex = 0;
        play();
      }
    }
    else {
      listIndex = (listIndex === playList.length - 1) ? 0 : listIndex + 1;
      play();
    }
  }

  function volumeToggle() {
    if(audio.muted) {
      if(parseInt(volHeight, 10) === 0) {
        volVerticalBar.style.height = '100%';
        audio.volume = 1;
      }
      else {
        volVerticalBar.style.height = volHeight;
      }
      audio.muted = false;
      this.classList.remove('muted');
    }
    else {
      audio.muted = true;
      volVerticalBar.style.height = 0;
      this.classList.add('muted');
    }
  }

  /* Destroy method. Clear All */
  function FinishClearAllMethodsEvents() {
    if(!apActive) return;

    playMusic.removeEventListener('click', togglePlayMusic, false);
    volButton.removeEventListener('click', volumeToggle, false);
    repeatBtn.removeEventListener('click', repeatToggle, false);
    pListBtn.removeEventListener('click', plToggle, false);

    musicProgressBar.parentNode.parentNode.removeEventListener('mousedown', dragMoveMusicBar, false);
    musicProgressBar.parentNode.parentNode.removeEventListener('mousemove', musicSeekLoad, false);
    document.documentElement.removeEventListener('mouseup', progressSeekingFalse, false);

    volVerticalBar.parentNode.parentNode.removeEventListener('mousedown', setVolumeBar, false);
    volVerticalBar.parentNode.parentNode.removeEventListener('mousemove', setVolume);
    document.documentElement.removeEventListener('mouseup', progressSeekingFalse, false);

    btnPrevious.removeEventListener('click', prev, false);
    btnNext.removeEventListener('click', next, false);

    audio.removeEventListener('error', error, false);
    audio.removeEventListener('timeupdate', update, false);
    audio.removeEventListener('ended', doEnd, false);
    musicplayer.parentNode.removeChild(musicplayer);

    // Playlist
    pl.removeEventListener('click', listHandler, false);
    pl.parentNode.removeChild(pl);

    audio.pause();
    apActive = false;
  }


  function dragVolumeBar(evt, el, dir) {
    var value;
    if(dir === 'horizontal') {
      value = Math.round( ((evt.clientX - el.offset().left) + window.pageXOffset) * 100 / el.parentNode.offsetWidth);
      el.style.width = value + '%';
      return value;
    }
    else {
      var offset = (el.offset().top + el.offsetHeight)  - window.pageYOffset;
      value = Math.round((offset - evt.clientY));
      if(value > 100) value = 100;
      if(value < 0) value = 0;
      volVerticalBar.style.height = value + '%';
      return value;
    }
  }

  function setVolumeBar(evt) {
    rtOnClick = (evt.which === 3) ? true : false;
    progressSeeking = true;
    setVolume(evt);
  }


  function dragMoveMusicBar(evt) {
    rtOnClick = (evt.which === 3) ? true : false;
    progressSeeking = true;
    musicSeekLoad(evt);
  }

 
  

  function setVolume(evt) {
    volHeight = volVerticalBar.css('height');
    if(progressSeeking && rtOnClick === false) {
      var value = dragVolumeBar(evt, volVerticalBar.parentNode, 'vertical') / 100;
      if(value <= 0) {
        audio.volume = 0;
        volButton.classList.add('muted');
      }
      else {
        if(audio.muted) audio.muted = false;
        audio.volume = value;
        volButton.classList.remove('muted');
      }
    }
  }

  function showMesssage(title, attr) {
    if(!byDefault.notification) {
      return;
    }
    if(window.Notification === undefined) {
      return;
    }
    window.Notification.requestPermission(function(access) {
      if(access === 'granted') {
        var notice = new Notification(title.substr(0, 110), attr);
        notice.onshow = function() {
          setTimeout(function() {
            notice.close();
          }, 5000);
        }
        // notice.onclose = function() {
        //   if(noticeTimer) {
        //     clearTimeout(noticeTimer);
        //   }
        // }
      }
    })
  }


  function musicSeekLoad(evt) {
    if(progressSeeking && rtOnClick === false && audio.readyState !== 0) {
      var value = dragVolumeBar(evt, musicProgressBar, 'horizontal');
      audio.currentTime = audio.duration * (value / 100);
    }
  }

  function progressSeekingFalse() {
    progressSeeking = false;
  }




/**
 * Property Joiners and Helpers in html and Css
 */
  
  function generateHtmlElement(el, attr) {
    var element = document.createElement(el);
    if(attr) {
      for(var name in attr) {
        if(element[name] !== undefined) {
          element[name] = attr[name];
        }
      }
    }
    return element;
  }

  function JoinProperty(defaults, options) {
    for(var name in options) {
      if(defaults.hasOwnProperty(name)) {
        defaults[name] = options[name];
      }
    }
    return defaults;
  }

  Element.prototype.offset = function() {
    var el = this.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: el.top + scrollTop,
      left: el.left + scrollLeft
    };
  };

  Element.prototype.css = function(attr) {
    if(typeof attr === 'string') {
      return getComputedStyle(this, '')[attr];
    }
    else if(typeof attr === 'object') {
      for(var name in attr) {
        if(this.style[name] !== undefined) {
          this.style[name] = attr[name];
        }
      }
    }
  };


/**
 *  Public methods
 */
  return {
    onInitialize: onInitialize,
    FinishClearAllMethodsEvents: FinishClearAllMethodsEvents
  };

})();

window.MYMUSICPLAYER = Audiomusicplayer;

})(window);