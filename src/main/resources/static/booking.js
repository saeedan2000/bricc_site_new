"use strict";
// This file contains the logic for the booking page.
//
// Removed bulk booking support for v1.
//
// TODO must avoid a clash in slots. We should not recommend a slot that is already selected from a previous booking attempt.
// but that's a backend thing i think. For now this doesn't matter since we aren't initially supporting 
// bulk bookings.
(function() {

    const WEB_SERVER_URL = new URL('http://localhost:9090');

    const API_PATH = '/api';
    
    const INIT_PATH = '/init';

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

    const State = {     // essentially an enum
        DATE_LANE_SCREEN: 0,
        TIME_SUBMIT_SCREEN: 1,
        BOOKABLE_SCREEN: 2
    };

    let booker;

    // These don't really belong in the state object since I don't want UI elems in the state.
    // Adding them there forces the render functions to mess with state which I don't want.
    let selectedCalTile, selectedTimeTile = null;

    // TODO 
    const DUMMY_BOOKABLE_DATA = [
        {
            type: 'Indoor',
            lanes: [1],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Indoor',
            lanes: [2],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Indoor',
            lanes: [3],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Indoor',
            lanes: [4],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Indoor',
            lanes: [5],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Outdoor',
            lanes: [1],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Outdoor',
            lanes: [2],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Outdoor',
            lanes: [3],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Outdoor',
            lanes: [4],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        },
        {
            type: 'Outdoor',
            lanes: [5],
            date: '2022-7-16',
            startTime: {
                hours: 7,
                minutes: 30
            },
            numHours: 1
        }
    ];

    const DUMMY_TIME_DATA = {
        openingTime: {
            hours: 5,
            minutes: 30
        },
        closingTime: {
            hours: 16,
            minutes: 30
        },
        minTimeInterval: 30,
        defaultBookingLength: 1,
        maxBookingLength: 5,
        bookableTimes: [
            {
                hours: 8,
                minutes: 0
            },
            {
                hours: 9,
                minutes: 0
            },
            {
                hours: 9,
                minutes: 30
            },
            {
                hours: 10,
                minutes: 0
            },
            {
                hours: 12,
                minutes: 30
            },
            {
                hours: 13,
                minutes: 30
            },
            {
                hours: 14,
                minutes: 0
            },
            {
                hours: 14,
                minutes: 30
            },
            {
                hours: 15,
                minutes: 0
            },
            {
                hours: 15,
                minutes: 30
            },
            {
                hours: 16,
                minutes: 0
            }
        ]
    };


    // shorthand
    function $(id){
        return document.getElementById(id);
    }

    function createElem(tag, identifier) {
        let elem = document.createElement(tag);
        if (identifier.charAt(0) == '#') {
            elem.setAttribute('id', identifier.substring(1));
        } else if (identifier.charAt(0) == '.') {
            elem.setAttribute('class', identifier.substring(1));
        } else {
            alert("Invalid identifier passed to createElem");
        }
        return elem;
    }

    function addLabel(str, container) {
        let label = document.createElement('h2');
        label.textContent = str;
        container.appendChild(label);
    }

    function showError(str, container) {
        let error = container.querySelector('.error');
        error.textContent = str;
        error.classList.remove('hidden');
    }

    function getCalendarTiles() {
        let tiles = new Array();
        // first add the column headers, then the regular tiles
        ['Sat', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sun'].forEach(function(elem) { 
            let calColHeader = document.createElement('div');
            calColHeader.classList.add('calColHeader');
            calColHeader.textContent = elem;
            tiles.push(calColHeader);
        });
        for (let i = 0; i < 35; i++) { // add regular calendar tiles
            let calTile = createElem('div', '.calTile');
            calTile.textContent = '';
            tiles.push(calTile);
        }
        return tiles;
    }

    function onPrevCalMonthClick() {
        let cal = booker.calState;
        cal.curMonth--;
        if (cal.curMonth < 0) {
            cal.curYear--;
            cal.curMonth = 11;
        } 
        renderCalendar();
    }

    function onNextCalMonthClick() {
        let cal = booker.calState;
        cal.curMonth++;
        if (cal.curMonth > 11) {
            cal.curYear++;
            cal.curMonth = 0;
        } 
        renderCalendar();
    }

    // This is the onclick function for a valid calendar day tile.
    function onCalDayClick() {
        // update calendar state
        let cal = booker.calState;
        cal.selectedYear = cal.curYear;
        cal.selectedMonth = cal.curMonth;
        cal.selectedDate = parseInt(this.textContent); 
        if (selectedCalTile != null) {
            selectedCalTile.classList.remove('selectedTile'); // null if on nonselected month/year
        }
        selectedCalTile = this;

        // give this tile selected styling
        this.classList.add('selectedTile');

        // update the selectedDate display
        updateCalSelectedDateDisplay();
    }

    function updateCalSelectedDateDisplay() {
        let cal = booker.calState;
        $('selectedDateDisplay').textContent = 'Selected Date: ' + 
            (cal.selectedMonth + 1) + '/' + 
            cal.selectedDate + '/' 
            + cal.selectedYear;
    }

    // Clears any existing tiles and does a fresh render of the calendar for the current month/year. 
    // Does not change any calState fields, only renders the ui to match them.
    function renderCalendar() {
        let cal = booker.calState;
        // update month/year and selected date.
        $('monthYearDisplay').textContent = monthNames[cal.curMonth] + ' ' + cal.curYear;
        updateCalSelectedDateDisplay();

        // clear the old selected tile.
        if (selectedCalTile != null) {
            selectedCalTile.classList.remove('selectedTile');
        }
        selectedCalTile = null;

        // Now render the calendar for the current month/year
        let tiles = document.querySelectorAll('.calTile');
        let dayOffset = new Date(cal.curYear, cal.curMonth).getDay();
        let daysInMonth = 32 - (new Date(cal.curYear, cal.curMonth, 32)).getDate();
        for (let i = 0; i < tiles.length; i++) {
            if (i >= dayOffset && i - dayOffset < daysInMonth) {
                // if it already has text we don't need to do this.
                if (tiles[i].textContent === '') {
                    tiles[i].addEventListener('click', onCalDayClick);
                    tiles[i].classList.add('clickableTile');
                }
                tiles[i].textContent = i - dayOffset + 1;

                // if the tile is the selected tile, make it appear so.
                if (cal.curYear == cal.selectedYear && 
                        cal.curMonth == cal.selectedMonth && 
                        cal.selectedDate == i - dayOffset + 1) {

                    tiles[i].classList.add('selectedTile');
                    // old selected tile should be null, we cleared it earlier in this func.
                    selectedCalTile = tiles[i];
                }
            } else {
                if (tiles[i].textContent !== '') {
                    tiles[i].removeEventListener('click', onCalDayClick);
                    tiles[i].classList.remove('clickableTile');
                }
                tiles[i].textContent = '';
            }
        }
    }

    function createCalendar() {
        // Create the display for the currently selected date.
        let selectedDateDisplay = createElem('div', '#selectedDateDisplay');
        selectedDateDisplay.textContent = "Your Selected Date is: ";

        // Create the button for going back a month
        let prevMonthButton = createElem('div', '#prevMonthButton');
        prevMonthButton.setAttribute('class', 'calButton');
        prevMonthButton.textContent = 'Prev';
        prevMonthButton.addEventListener('click', onPrevCalMonthClick);

        // Create the button for going forward a month
        let nextMonthButton = createElem('div', '#nextMonthButton');
        nextMonthButton.setAttribute('class', 'calButton');
        nextMonthButton.textContent = 'Next';
        nextMonthButton.addEventListener('click', onNextCalMonthClick);

        // Create the display for the current month and year shown on the calendar
        let monthYearDisplay = createElem('div', '#monthYearDisplay');

        // Create a css grid which contains everything for the calendar, day tiles, buttons, etc.
        // We must append the various components to it in order, then append it to the picker element.
        let calGrid = createElem('div', '#calGrid');
        calGrid.append(selectedDateDisplay);
        calGrid.append(...getCalendarTiles()) // using spread syntax to pass array as indiv. params.
        calGrid.append(prevMonthButton, monthYearDisplay, nextMonthButton);

        return calGrid;
    }

    // Probably doesn't need it's own function, but in keeping with the pattern.
    function renderLanePicker() {
        $('laneNumDisplay').textContent = booker.laneState.num.toString();
    }

    // Probably doesn't need it's own function, but in keeping with the pattern.
    function renderNumHoursPicker() {
        $('numHoursDisplay').textContent = booker.timeState.numHours.toString();
    }


    function createNumPicker(input) {
        let numDisplay = createElem('div', '.numDisplay');
        numDisplay.id = input.displayId;

        let nextButton = document.createElement('div'); // maybe remove id for corresponding button for lane picker
        nextButton.classList.add('incDecButton');
        nextButton.textContent = '>';
        nextButton.addEventListener('click', input.onNext);

        let prevButton = document.createElement('div');
        prevButton.classList.add('incDecButton');
        prevButton.textContent = '<';
        prevButton.addEventListener('click', input.onPrev);

        let label = document.createElement('p');
        label.textContent = input.labelText;

        // Create container to hold these elements
        let numPickerContainer = createElem('div', '.numPickerContainer');
        numPickerContainer.append(label, prevButton, numDisplay, nextButton);
        return numPickerContainer;
    }

    function createBookerButton(text, onClick) {
        let b = document.createElement('div');
        b.classList.add('bookerButton');
        b.textContent = text;
        b.addEventListener('click', onClick);
        return b;
    }

    function totalMinutes(time) {
        return (time.hours * 60) + time.minutes;
    }

    // Requires hours and minutes to be ints.
    function isValidTime(time) {
        let mins = totalMinutes(time);
        let end = totalMinutes(booker.timeState.initData.closingTime);
        let start = totalMinutes(booker.timeState.initData.openingTime);
        return start <= mins && mins < end;
    }

    // Adds the minimum interval to the given time.
    function incrementTime(time) {
        let mins = totalMinutes(time) + booker.timeState.initData.minTimeInterval;
        time.hours = Math.floor(mins / 60);
        time.minutes = mins % 60;
    }
    
    // Convert 0-index hours to 1 index, add colon and zeros, add am/pm
    // Requires 0 <= hours <= 23 and 1 <= minutes <= 60
    function convertTimeToString(time) {
        let arr = new Array();
        let amPm = "am";
        if (time.hours >= 12) {
            amPm = "pm";
            arr.push((time.hours - 11).toString());
        } else {
            arr.push((time.hours + 1).toString());
        }
        arr.push(':');
        if (time.minutes < 10) {
            arr.push('0');
        } 
        arr.push(time.minutes.toString(), ' ', amPm);
        return arr.join("");
    }

    function areEqual(t1, t2) {
        return (t1.hours == t2.hours) && (t1.minutes == t2.minutes);
    }

    // On click handler for time tile
    function onTimeSelected() {
        let tState = booker.timeState;
        tState.selectedTime = JSON.parse(this.getAttribute('time'));
        if (selectedTimeTile != null) {
            selectedTimeTile.classList.remove('selectedTile');
        }
        selectedTimeTile = this;
        this.classList.add('selectedTile');
    }

    function renderTimePicker() {
        let tState = booker.timeState;
        // Remove any old tiles
        let scroller = $('timePickerScroller');
        scroller.textContent = '';

        // any old selected tile is irrelevant, since we might have new data
        selectedTimeTile = null;

        // Create a tile for every possible time.
        // Then, based on the initData set it as clickable or not
        let curBookableIndex = 0;
        let timeIndex = {...tState.initData.openingTime};
        for(; isValidTime(timeIndex); incrementTime(timeIndex)) {
            let tile = createElem('div', '.timeTile');
            
            // if the time is a bookable time, then make it clickable
            // TODO: if bookable times don't match our indexes we are in trouble
            // TODO: move this logic to server side, this is too funky.
            if (areEqual(
                timeIndex, 
                tState.initData.bookableTimes[curBookableIndex]
            )) {
                curBookableIndex++;
                tile.addEventListener('click', onTimeSelected);
                tile.classList.add('clickableTile');
                tile.setAttribute('time', JSON.stringify(timeIndex));

                // If we don't have a selectedTile, this is the first (default).
                if (selectedTimeTile == null) {
                    selectedTimeTile = tile;
                    tile.classList.add('selectedTile');
                }
            }

            tile.textContent = convertTimeToString(timeIndex);
            scroller.append(tile);
        }
    }

    // since the number of tiles varies based on the api response, we add tiles in renderTimePicker()
    function createTimePicker() {
        let timePickerContainer = createElem('div', '#timePickerContainer');
        let scroller = createElem('div', '#timePickerScroller');
        
        timePickerContainer.append(scroller);
        return timePickerContainer;
    }

    function fakeTimesApiCall() {
        let response = DUMMY_TIME_DATA;
        booker.timeState = {
            initData: response,
            selectedTime: { ...response.bookableTimes[0] },
            numHours: response.defaultBookingLength // TODO this could persist
        };
        booker.initTimePicker();
    }

    // Concatenate everything in the slot object into a string
    function slotKeyGen(s) {
        return [s.type, ...[...s.lanes].sort(), s.date, s.startTime.hours, 
            s.startTime.minutes, s.numHours].join(',');
    }

    // Returns true if the given slot was selected and got removed.
    function removeIfSelected(s1) {
        let isSelected = false;
        booker.bookState.selected.forEach(function(s2) {
            if (slotKeyGen(s1) == slotKeyGen(s2)) {
                booker.bookState.selected.delete(s2);
                isSelected = true;
            }
        });
        return isSelected;
    }

    function onSlotClick() {
        let data = JSON.parse(this.getAttribute('data'));
        this.querySelector('.slotTime').classList.toggle('hidden');
        if (removeIfSelected(data)) {
            this.classList.remove('selectedSlotTile');
        } else {
            booker.bookState.selected.add(data);
            this.classList.add('selectedSlotTile');
        }
    }

    function createTile(slot, isSelected) {
        // create elements for all the data on a tile
        let type = document.createElement('h1');
        type.textContent = slot.type;

        let num = document.createElement('p');
        if (booker.laneState.num == 1) {
            num.textContent = 'Net ' + slot.lanes.join(', ');
        } else {
            num.textContent = 'Nets: ' + slot.lanes.join(', ');
        }

        let time = document.createElement('p');
        time.classList.add('slotTime');
        time.classList.add('hidden');
        time.textContent = slot.numHours + ' hour(s), from ' +
            convertTimeToString(slot.startTime);

        // create the tile and append everything to it.
        let tile = createElem('div', '.slotTile');
        tile.setAttribute('data', JSON.stringify(slot));
        tile.addEventListener('click', onSlotClick);
        if (slot.type == "Indoor") {
            tile.classList.add('indoorSlotTile');
        } 
        if (isSelected) {
            tile.classList.add('selectedSlotTile');
        }
        tile.append(type, num, time);
        return tile;
    }

    function renderSlotPicker() {
        let cont = $('slotPickerContainer');
        // Create and append a tile for each unselected slot
        booker.bookState.slots.forEach(function(s) {
            cont.append(createTile(s, false));
        });

        // Create the boundary between selected and unselected slots
        let b = createElem('h1', '#slotBoundary');
        b.textContent = 'Your Selected Slots: ';
        cont.append(b);

        // Create and append a tile for each selected slot
        booker.bookState.selected.forEach(function(s) {
            cont.append(createTile(s, true));
        });
    }

    function fakeBookableApiCall() {
        let response = DUMMY_BOOKABLE_DATA;

        // We want to update slots but keep selected if it's already set. 
        // So you can return but not lose your cart.
        // Update: removed bulk booking support so always overwrite.
        if (booker.bookState == null || true) { // TODO: This is where we can turn on bulk.
            booker.bookState = {
                slots: response,
                selected: new Set()
            };
        } else {
            booker.bookState.slots = response;
        }

        booker.initSlotPicker();
    }

    function createContactForm() {
        // create input for email
        let eLabel = document.createElement('label');
        eLabel.textContent = 'Email: ';
        let eIn = createElem('input', '#emailInput');
        eIn.setAttribute('type', 'text');

        // create newLine
        let br = document.createElement('br');

        // create input for name
        let nLabel = document.createElement('label');
        nLabel.textContent = 'Name: ';
        let nIn = createElem('input', '#nameInput');
        nIn.setAttribute('type', 'text');

        return [eLabel, eIn, br, nLabel, nIn];
    }

    // TODO
    // Maybe validation should happen on the server side.
    function contactInfoIsValid(info) {
        if (info.email == '' || info.name == '') {
            return false;
        }
        return true;
    }

    function renderBooker() {
        // CLEAR whatever was showing in the booker before.
        booker.elem.textContent = '';

        if (booker.overallState == State.DATE_LANE_SCREEN) {
            booker.initDateLanePicker();
        } else if (booker.overallState == State.TIME_SUBMIT_SCREEN) {
            fakeTimesApiCall();
        } else if (booker.overallState == State.BOOKABLE_SCREEN) {
            fakeBookableApiCall();
        }
    }

    // The init functions require relevant state to be already set.
    // Generally, we set state, then call init, which calls render;
    function Booker() {
        this.initDateLanePicker = function() {
            // Create a div to hold both the calendar and lane picker.
            let dateLanePickerContainer = document.createElement('div');
            this.elem.appendChild(dateLanePickerContainer);

            // Add date picker label and calendar/datepicker
            addLabel('Please select a date below for your booking', dateLanePickerContainer);
            dateLanePickerContainer.append(createCalendar());

            // render the calendar (based on the calState which should already be set
            renderCalendar();

            // Add label and lanepicker and numhours picker
            addLabel('How many lanes would you like to book and for how long?', dateLanePickerContainer);

            dateLanePickerContainer.append(createNumPicker({  // lanepicker
                labelText: 'Lanes : ',
                displayId: 'laneNumDisplay',
                onNext: function() {
                    if (booker.laneState.num < booker.laneState.max) {
                        booker.laneState.num++;
                        renderLanePicker()
                    }
                },
                onPrev: function() {
                    if (booker.laneState.num > 1) {
                        booker.laneState.num--;
                        renderLanePicker()
                    }
                }
            }));
            renderLanePicker(); // render as above
            dateLanePickerContainer.append(createNumPicker({ // num hours picker
                labelText: 'Hours: ',
                displayId: 'numHoursDisplay',
                onNext: function() {
                    if (booker.timeState.numHours < booker.timeState.maxHours) {
                        booker.timeState.numHours++;
                        renderNumHoursPicker()
                    }
                },
                onPrev: function() {
                    if (booker.timeState.numHours > 1) {
                        booker.timeState.numHours--;
                        renderNumHoursPicker()
                    }
                }
            }));
            renderNumHoursPicker(); //render as above

            // Add the button to submit date and lane choices and move to the next stage of booking.
            dateLanePickerContainer.append(
                createBookerButton('Next', function() {
                    // update booker state and rerender
                    booker.overallState = State.TIME_SUBMIT_SCREEN;
                    renderBooker();
                }));
        }

        this.initTimePicker = function() {
            let timePickerAndSubmitContainer = document.createElement('div');
            this.elem.append(timePickerAndSubmitContainer);

            // Add time picker label and the time picker itself.
            addLabel('What time would you like your booking to start?', timePickerAndSubmitContainer);
            timePickerAndSubmitContainer.append(createTimePicker());

            // render based on timeState which should already be set.
            renderTimePicker();

            // Add the button to submit the date, lane, and time choices and move on.
            timePickerAndSubmitContainer.append(
                createBookerButton('Next', function() {
                    // temp logging
                    let submittedDate = {
                        year: booker.calState.selectedYear,
                        month: booker.calState.selectedMonth,
                        date: booker.calState.selectedDate
                    }
                    let submitData = {
                        date: submittedDate,
                        lane: booker.laneState.num
                    }
                    // update booker state and rerender
                    booker.overallState = State.BOOKABLE_SCREEN;
                    renderBooker();
                }));

            // Add the button to return to the date/lane pickers.
            timePickerAndSubmitContainer.append(
                createBookerButton('Go Back', function() {
                    // update booker state and rerender
                    booker.overallState = State.DATE_LANE_SCREEN;
                    renderBooker();
                }));
        }

        this.initSlotPicker = function() {
            let slotPickerAndSubmitContainer = document.createElement('div');
            this.elem.append(slotPickerAndSubmitContainer);
            
            // Add label. Most of the construction is tile-by-tile, so no 
            // createBookablePicker()
            addLabel('Please select from the slots we have available: ', slotPickerAndSubmitContainer);
            slotPickerAndSubmitContainer.append(createElem('div','#slotPickerContainer'));
            renderSlotPicker();

            // Add the container for errors
            let error = document.createElement('h2');
            error.classList.add('error', 'hidden');
            slotPickerAndSubmitContainer.append(error);

            // Add the form for customer info.
            addLabel('Please provide your contact information below: ', slotPickerAndSubmitContainer);
            slotPickerAndSubmitContainer.append(...createContactForm()); // does not need render() since static

            // Add the button to move forward.
            slotPickerAndSubmitContainer.append(
                createBookerButton('Pay', function() {
                    // TODO 
                    let cInfo =  {
                        email: $('emailInput').value,
                        name: $('nameInput').value
                    };
                    if (booker.bookState.selected.size == 0) {
                        showError('Please select the slot(s) you would like to book.', 
                            slotPickerAndSubmitContainer);
                    } else if (!contactInfoIsValid(cInfo)) {
                        showError('Invalid name or email.', slotPickerAndSubmitContainer);
                    } else {
                        error.classList.add('hidden');
                    }
                    booker.bookState.contact = cInfo;
                    console.log(cInfo);
                    booker.bookState.selected.forEach(function(s) {
                        console.log(s);
                    });
                }));

            // Instead of going back to time picker, I think it's more efficient to go all the way back.
            // NOTE: here is where we would add more if we support bulk
            /*slotPickerAndSubmitContainer.append(
                createBookerButton('Go Back', function() {
                    // update booker state and rerender
                    booker.overallState = State.DATE_LANE_SCREEN;
                    renderBooker();
                }));*/
        }

        // Set the state of the booker.
        this.setState = function(state) {
            this.calState = state.calState;
            this.timeState = state.timeState;
            this.laneState = state.laneState;
            this.overallState = state.overallState;
        }

        this.init = function(elem) {
            this.elem = elem;

            // render the booker
            renderBooker();
        }

    }

    // fetch ajax boilerplate
    function checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response.text();
        } else {
            return Promise.reject(new Error(response.status +
                                            ": " + response.statusText));
        }
    }
    
    // Takes a URL object, not a string
    function ajaxGet(input) {
        fetch(input.url.href, {mode: 'no-cors'})
           .then(checkStatus)
           .then(function(responseText) {
               input.handleResponse(responseText); 
           })
           .catch(function(error) {
               input.handleError(error);
           });
    }

    // Takes a URL object, not a string
    function ajaxPost() {
        fetch(input.url.href, {method: "POST", body: input.data})
           .then(checkStatus)
           .then(function(responseText) {
                input.handleResponse(responseText)
           })
           .catch(function(error) {
               input.handleError(error);
           });
    }

    function handleInitResponse(responseText) {
        let response = JSON.parse(responseText);

        // Create the booker, set its state, then call init.
        // This allows us to potentially pull a saved state from somewhere to initialize the booker.
        let todaysDate = new Date();
        booker = new Booker();
        booker.setState({
            calState: {
                selectedYear: todaysDate.getFullYear(),
                selectedMonth: todaysDate.getMonth(),
                selectedDate: todaysDate.getDate(),
                curMonth: todaysDate.getMonth(),
                curYear: todaysDate.getFullYear()
            },
            laneState: {
                num: response.defaultNumLanes,
                max: response.maxNumLanes
            },
            timeState: {
                numHours: response.defaultNumHours,
                maxHours: response.maxNumHours
            },
            bookState: null,
            overallState: State.DATE_LANE_SCREEN
        });
        booker.init($('bookingContainer'));
    }

    window.addEventListener('load', function() {
        WEB_SERVER_URL.pathname = API_PATH + INIT_PATH;
        ajaxGet({
            url: WEB_SERVER_URL,
            handleResponse: handleInitResponse,
            handleError: console.log
        });
    });
})();
