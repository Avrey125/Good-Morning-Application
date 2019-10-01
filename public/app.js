'use strict';

function storeUserInfo(e){
  let login = {
    name: $('#name').val(),
    gmail: $('#gmail').val()
  }
  console.log('click')
  localStorage.setItem('login', JSON.stringify(login))
}

function renderCalendar(){
  let gmail = JSON.parse(localStorage.getItem('login')).gmail
  $('#displayRight').append(`<iframe src="https://calendar.google.com/calendar/embed?src=${gmail}%40gmail.com&ctz=America%2FLos_Angeles" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>`)
}
if (JSON.parse(localStorage.getItem('login')).name){
  let login = {
    name: JSON.parse(localStorage.getItem('login')).name,
    gmail: JSON.parse(localStorage.getItem('login')).gmail
  }
  // $('#loginForm').toggleClass('hidden');
  $('#name').attr('value', login.name);
  $('#gmail').attr('value', login.gmail);
  $('button').text('Welcome Back!')
}

$('#loginForm').on('submit', () => storeUserInfo())

renderCalendar();
