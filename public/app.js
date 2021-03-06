'use strict';

function storeUserInfo(e){
  let login = {
    name: $('#name').val(),
    gmail: $('#gmail').val(),
    zipcode: $('#zipcode').val()
  }
  console.log('click')
  localStorage.setItem('login', JSON.stringify(login))
}

function renderCalendar(){
  let gmail = JSON.parse(localStorage.getItem('login')).gmail
  $('#displayRight').append(`<iframe src="https://calendar.google.com/calendar/embed?src=${gmail}%40gmail.com&ctz=America%2FLos_Angeles" style="border: 0" width="600" height="500" frameborder="0" scrolling="no"></iframe>`)
}
if (JSON.parse(localStorage.getItem('login'))){
  let login = {
    name: JSON.parse(localStorage.getItem('login')).name,
    gmail: JSON.parse(localStorage.getItem('login')).gmail,
    zipcode: JSON.parse(localStorage.getItem('login')).zipcode
  }
  // $('#loginForm').toggleClass('hidden');
  $('#name').attr('value', login.name);
  $('#gmail').attr('value', login.gmail);
  $('#zipcode').attr('value', login.zipcode);
  renderCalendar();
  $('#name').text('Good Morning ' + login.name)
}
$('#newsSaved').on('click', (e) => {
  $('.saved').toggleClass('hidden');
})
$('#loginForm').on('submit', () => storeUserInfo())

$(document).ready(function(){
  $('#newsButton').click(function(event) {
    $('.toggleDisplay').toggle();
  });
});


