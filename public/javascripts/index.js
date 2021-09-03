// const songs = document.getElementsByClassName('container allsongs');
// console.log(songs)
// for(let song of songs) {
//     song.addEventListener('mouseenter', function(event) {
//         songInfo = event.target.getElementsByClassName('song-info')[0];
//         songInfo.classList.remove('invisible');
//         songInfo.classList.add('visible');
//     }, false);

//     song.addEventListener('mouseleave', function(event) {
//         songInfo = event.target.getElementsByClassName('song-info')[0];
//         songInfo.classList.remove('visible');
//         songInfo.classList.add('invisible');
//     }, false);
// };

// $('.allsongs, .container').hover(function() {
//     console.log('FIRST,', $(this)[0].getElementsByClassName('song-info'))
//     // $(this)[0].getElementsByClassName('song-info')[0].classList.add('visible');
// }, function() {
//     console.log('SECOND,', $(this)[0].getElementsByClassName('song-info'))
//     // $(this)[0].getElementsByClassName('song-info')[0].classList.remove('visible');
// });

$(document).ready(function(){

    $(".allsongs").hover(function(){
        var imgWidth = $('.allsongs-image').width();
        $('.song-info').width(imgWidth);
        $(this)[0].getElementsByClassName('song-info')[0].classList.add('visible');
    },
    function(){
        var imgWidth = $('.allsongs-image').width();
        $('.song-info').width(imgWidth);
        $(this)[0].getElementsByClassName('song-info')[0].classList.remove('visible');
    }); 
  });
