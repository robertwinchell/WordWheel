var randLetter = function(){
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
};

// global variables of games
var gameMode, // 'single' or 'multi'
    timerEnabled,
    letters, // 0 - center letter, 1~8 - others
    matchWords, // checked from defaultWords in words.js file
    curWord,
    remainTime,
    timerId,
    usedHint,
    curUser,
    singleHintWord,
    score = {'owner': 0, 'member': 0};
// elements of game area
var ownerInputBox,
    ownerListPan,
    ownerScoreElement,
    ownerErrorElement,
    memberInputBox,
    memberListPan,
    memberScoreElement,
    memberErrorElement
    ;

function start_game(mode){
    $('#home-area').addClass('dis-none');
    $('#game-area').removeClass('dis-none');

    gameMode = mode;
    timerEnabled = $('#timer-check').prop('checked');

    if (mode == 'single'){
        $('#member-panel').addClass('dis-none');
        $('.hint-panel').addClass('dis-none');
    }
    else{
        $('#member-panel').removeClass('dis-none');
        $('.hint-panel').removeClass('dis-none');
    }
    init_game();
}

function renew(){
    $('#home-area').removeClass('dis-none');
    $('#game-area').addClass('dis-none');
    if (timerId)
        clearInterval(timerId);
    $('#timer-label').html('');
}

function init_game(){
    // clear score
    score.owner = 0;
    score.member = 0;
    usedHint = {owner: 0, member: 0};
    curWord = {owner: '', member: ''};
    curUser = 'owner';
    singleHintWord = '';

    // generate random 9 letters
    letters = [];
    for (var i=0; i<9; i++){
        while(1){
            var char = randLetter();
            if (letters.indexOf(char) == -1){
                if (i != 0){
                    letters.push(char);
                    break;
                }
                else if(char == 'A' || char == 'E' || char == 'I' || char == 'O' || char == 'U' || char == 'Y'){
                    letters.push(char);
                    break;
                }
            }
        }
        $('#letter' + i).html(letters[i]);
    }

    // get matched words
    matchWords = [];
    for (var i=0; i<defaultWords.length; i++){
        var word = defaultWords[i].toUpperCase();
        if (word.length < 10 && word.length>2 && word.indexOf(letters[0])>-1){
            var addFlag = true;
            for (var j=0; j<word.length; j++){
                var curLetter = word[j];
                if (letters.indexOf(curLetter) == -1){
                    addFlag = false;
                    break;
                }
                else if (word.indexOf(curLetter) != word.lastIndexOf(curLetter)){
                    addFlag = false;
                    break;
                }
            }
            if (addFlag)
                matchWords.push(word);
        }
    }
    console.log(matchWords);

    // init elements
    ownerInputBox = $('#owner-input');
    ownerListPan = $('#owner-list-pan');
    ownerScoreElement = $('#owner-score');
    ownerErrorElement = $('#owner-error');
    memberInputBox = $('#member-input');
    memberListPan = $('#member-list-pan');
    memberScoreElement = $('#member-score');
    memberErrorElement = $('#member-error');

    ownerListPan.empty();
    memberListPan.empty();
    $('#hint-label').html('');
    $("input:checkbox").prop('checked', false);

    if (timerEnabled){
        remainTime = defaultRemainTime;
        timerId = setInterval(function(){
            remainTime --;
            var m = Math.floor(remainTime/60),
                s = remainTime % 60;
            $('#timer-label').html((m<10 ? '0' + m : m) + ' : ' + (s<10 ? '0' + s : s));
            if (remainTime == 0)
                end_game();
        }, 1000);
    }

    refresh_views();
}

function end_game(){
    if (timerEnabled)
        clearInterval(timerId);

    var text = '';
    if (gameMode == 'single'){
        if (matchWords.length > 0)
            text = 'You were failed.';
        else
            text = 'Well Done.'
    }
    else {
        if (score.owner > score.member)
            text = 'Team A is win.';
        else
            text = 'Team B is win.'
    }

    var menu = $("<div>").addClass("menudiv");
    menu.append("<h2>" + text + "</h2>");
    var newBtn = $("<button class='btn btn-danger'>").text("New Game")
        .click(function() {
            menu.remove();
            renew();
        });
    menu.append(newBtn);
    var retryBtn = $("<button class='btn btn-success ml-20'>").text("Play Again")
        .click(function(){
            menu.remove();
            init_game();
        });
    menu.append(retryBtn);

    $("body").append(menu);

}

function click_letter(index){
    var targetElement = (index == 0) ? $('#letter0') : $('#letter' + index).parent('li');
    targetElement.toggleClass('active');

    var char = letters[index];
    if (gameMode == 'single'){
        if (targetElement.hasClass('active'))
            curWord.owner += char;
        else
            curWord.owner.splice(curWord.owner.indexOf(char), 1);
        ownerInputBox.val(curWord.owner);
    }
    else {
        if (targetElement.hasClass('active'))
            curWord[curUser] += char;
        else
            curWord[curUser].splice(curWord[curUser].indexOf(char), 1);

        if (curUser == 'owner')
            ownerInputBox.val(curWord[curUser]);
        else
            memberInputBox.val(curWord.member);
    }
}

function refresh_views(){
    ownerScoreElement.html('Score: ' + score.owner);
    memberScoreElement.html('Score: ' + score.member);
    if(matchWords.length > 0)
        $('#remain-label').html(matchWords.length + ' words are remaining.');
    else {
        $('#remain-label').html('All words are searched.');
        end_game();
    }
}

function submit_word(user){
    if (!curWord[user] || user != curUser)
        return;

    if(gameMode != 'single'){
        curUser = (curUser == 'owner') ? 'member' : 'owner';
        $('#hint-label').html('');
        $('.name-label').toggleClass('active');
    }

    var err = null, index;
    if (user == 'owner'){
        if (curWord.owner.indexOf(letters[0])<0){
            err = 'Should be contained center character ' + letters[0];
        }
        else if (matchWords.indexOf(curWord.owner)<0){
            err = curWord.owner + ' is not a valid word.'
        }

        if (err){
            //if(gameMode != 'single'){
                curWord.owner = '';
                ownerInputBox.val('');
                $('.role-panel').find('.active').removeClass('active');
            //}
            return display_error(ownerErrorElement, err);
        }
        else {
            ownerListPan.append($('<div class="mt-5 pl-10 pr-10">').html(curWord.owner));
            ownerListPan.scrollTop(10000);
            score.owner += (curWord.owner.length * 10);
            index = matchWords.indexOf(curWord.owner);
            curWord.owner = '';
            ownerInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
        }
    }
    else {
        if (curWord.member.indexOf(letters[0])<0){
            err = 'Should be contained center character ' + letters[0];
        }
        else if (matchWords.indexOf(curWord.member)<0){
            err = curWord.member + ' is not a valid word.'
        }

        if (err){
            curWord.member = '';
            memberInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
            return display_error(memberErrorElement, err);
        }
        else {
            memberListPan.append($('<div class="mt-5 pl-10 pr-10">').html(curWord.member));
            memberListPan.scrollTop(10000);
            score.member += (curWord.member.length * 10);
            index = matchWords.indexOf(curWord.member);
            curWord.member = '';
            memberInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
        }
    }

    matchWords.splice(index,1);
    refresh_views();
}

function enter_key(e, userRole){
    if (curUser != userRole)
        return e.preventDefault();

    if (e.keyCode == 13)
        return submit_word(userRole);

    var char = String.fromCharCode(e.keyCode).toUpperCase(),
        err = null;

    if (curUser == 'owner')
        curWord[curUser] = ownerInputBox.val();
    else
        curWord[curUser] = memberInputBox.val();

    if (letters.indexOf(char) == -1){
        err = 'No Matched Character'
    }
    else if (curWord[curUser].indexOf(char)>-1){
        err = 'Already Checked'
    }
    if(err){
        if (curUser == 'owner')
            display_error(ownerErrorElement, err);
        else
            display_error(memberErrorElement, err);
    }
    else {
        click_letter(letters.indexOf(char), true);
/*
        if (gameMode == 'single')
            click_letter(letters.indexOf(char), true);
        else {
            curWord[curUser] += char;
            if (curUser == 'owner')
                ownerInputBox.val(curWord.owner);
            else
                memberInputBox.val(curWord[curUser]);
        }
*/
    }
    e.preventDefault();
}

function display_error(errElement, errMsg){
    errElement.html(errMsg);
    setTimeout(function(){
        errElement.html('');
    }, 1000)
}

function click_hint(){
    if (gameMode == 'single'){
        if (!singleHintWord){
            singleHintWord = matchWords[Math.floor(Math.random() * matchWords.length)];
            $('#hint-label').html(singleHintWord.substring(0, 1));
        }
        else {
            var l = $('#hint-label').html().length;
            $('#hint-label').html(singleHintWord.substring(0, l+1));
            if (l == singleHintWord.length-1)
                singleHintWord = '';
        }

    }
    else {
        if (usedHint[curUser] >= 4)
            return;
        var hintWord = matchWords[Math.floor(Math.random() * matchWords.length)];
        $('#hint-label').html(hintWord);
        usedHint[curUser] ++;
        $("input:checkbox").each(function(key){
            if ($(this).attr('data-index') <= usedHint[curUser] && $(this).attr('data-role') == curUser){
                $(this).prop('checked', true);
            }
        });
    }
}

function clear_word(userRole){
    curWord[userRole] = '';
    $('.role-panel').find('.active').removeClass('active');
    ownerInputBox.val('');
    memberInputBox.val('');
}

$(function(){
    $('#timer-check').checkboxpicker({
        onLabel: 'Enable Timer',
        offLabel: 'Disable Timer'
    });
});