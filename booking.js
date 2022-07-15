"use strict";
// This file contains the logic for the booking page.
(function() {

    // as of now not planning to get this from backend, not something likely to change.
    const MAX_LANES_PER_BOOKING = 5;

    const DEFAULT_NUM_LANES = 1;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

    const State = {
        DATE_LANE_SCREEN: 0,
        TIME_SUBMIT_SCREEN: 1
    };

    let booker;

    // These don't really belong in the state object since I don't want UI elems in the state.
    // Adding them there forces the render functions to mess with state which I don't want.
    let selectedCalTile, selectedTimeTile = null;

    // TODO 
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

    // TODO should these just be anonymous
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

    function createLanePicker() {
        // Create display for currently selected number of lanes.
        let laneNumDisplay = createElem('div', '#laneNumDisplay');

        // Create button for increasing the number of lanes
        let nextLaneButton = createElem('div', '#nextLaneButton');
        nextLaneButton.classList.add('laneButton');
        nextLaneButton.textContent = '>';
        nextLaneButton.addEventListener('click', function() {
            if (booker.laneState.num < MAX_LANES_PER_BOOKING) {
                booker.laneState.num++;
                renderLanePicker()
            }
        });

        // Create button for decreasing the number of lanes.
        let prevLaneButton = createElem('div', '#prevLaneButton');
        prevLaneButton.classList.add('laneButton');
        prevLaneButton.textContent = '<';
        prevLaneButton.addEventListener('click', function() {
            if (booker.laneState.num > 1) {
                booker.laneState.num--;
                renderLanePicker()
            }
        });

        // Create container to hold these elements
        let lanePickerContainer = createElem('div', '#laneNumPickerContainer');
        lanePickerContainer.append(prevLaneButton, laneNumDisplay, nextLaneButton);
        return lanePickerContainer;
    }

    function createSubmitDateLaneButton() {
        let submitDateLaneButton = createElem('div', '#submitDateLaneButton');
        submitDateLaneButton.classList.add('bookerButton');
        submitDateLaneButton.textContent = 'Next';
        submitDateLaneButton.addEventListener('click', function() {

            // update booker state and rerender
            booker.overallState = State.TIME_SUBMIT_SCREEN;
            renderBooker();

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
            console.log("Submitted Date/Lane: " + JSON.stringify(submitData));
        });
        return submitDateLaneButton;
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
        booker.initTimePicker(response);
    }

    function createSubmitTimeButton() {
        let submitTimeButton = createElem('div', '#submitTimeButton'); 
        submitTimeButton.classList.add('bookerButton');
        submitTimeButton.textContent = 'Next';
        submitTimeButton.addEventListener('click', function() {

            // temp logging
            let submittedDate = {
                year: booker.calState.selectedYear,
                month: booker.calState.selectedMonth,
                date: booker.calState.selectedDate
            }
            let submitData = {
                date: submittedDate,
                lane: booker.laneState.num,
                time: booker.timeState.selectedTime
            }
            console.log("Submitted Date/Lane/Time: " + JSON.stringify(submitData));
        });
        return submitTimeButton;
    }

    function createReturnToDateLaneButton() {
        let backButton = document.createElement('div');
        backButton.textContent = 'Go Back';
        backButton.classList.add('bookerButton');
        backButton.addEventListener('click', function() {
            booker.overallState = State.DATE_LANE_SCREEN;
            renderBooker();
        });
        return backButton;
    }

    function renderBooker() {
        if (booker.overallState == State.DATE_LANE_SCREEN) {
            booker.initDateLanePicker();
        } else if (booker.overallState == State.TIME_SUBMIT_SCREEN) {
            fakeTimesApiCall();
        }
    }

    function Booker(o) {
        this.initDateLanePicker = function() {
            // CLEAR whatever was showing in the booker before.
            this.elem.textContent = '';
            
            // Create a div to hold both the calendar and lane picker.
            let dateLanePicker = createElem('div', '#dateLanePicker');
            this.elem.appendChild(dateLanePicker);

            // Add date picker label and calendar/datepicker
            addLabel('Please select a date below for your booking', dateLanePicker);
            dateLanePicker.append(createCalendar());

            // Set the state of the calendar if not already set (like coming back from time screen);
            let todaysDate = new Date();
            if (this.calState == null) {
                this.calState = {
                    selectedYear: todaysDate.getFullYear(),
                    selectedMonth: todaysDate.getMonth(),
                    selectedDate: todaysDate.getDate(),
                    curMonth: todaysDate.getMonth(),
                    curYear: todaysDate.getFullYear()
                }
            }
            renderCalendar();

            // Add lane picker label, and lane picker
            addLabel('How many lanes would you like to book?', dateLanePicker);
            dateLanePicker.append(createLanePicker());

            // Set the state of the lane picker, again, if not already set.
            if (booker.laneState == null) {
                booker.laneState = {
                    num: DEFAULT_NUM_LANES
                };
            }
            $('laneNumDisplay').textContent = booker.laneState.num.toString();

            // Add the button to submit date and lane choices and move to the next stage of booking.
            dateLanePicker.append(createSubmitDateLaneButton());
        }

        this.initTimePicker = function(data) {
            // CLEAR whatever was showing in the booker before.
            this.elem.textContent = '';

            let timePickerAndSubmitContainer = createElem('div', '#timePickerAndSubmitContainer');
            this.elem.append(timePickerAndSubmitContainer);

            // Add time picker label and the time picker itself.
            addLabel('What time would you like your booking to start?', timePickerAndSubmitContainer);
            timePickerAndSubmitContainer.append(createTimePicker());

            // set state, even if we have to override existing state since we make a fresh api call
            // every time we get here.
            booker.timeState = {
                initData: data,
                selectedTime: { ...data.bookableTimes[0] }
            };
            renderTimePicker();

            // Add the button to submit the date, lane, and time choices and move on.
            timePickerAndSubmitContainer.append(createSubmitTimeButton());

            // Add the button to return to the date/lane pickers.
            timePickerAndSubmitContainer.append(createReturnToDateLaneButton());

        }

        this.init = function() {
            this.elem = o.elem;

            // set the initial state
            this.calState = null;
            this.timeState = null;
            this.laneState = null;
            this.overallState = State.DATE_LANE_SCREEN;

            // render the booker
            renderBooker();
        }

    }

    window.addEventListener('load', function() {
        booker = new Booker({
            elem: $('bookingContainer')
        });
        booker.init();
    });
})();
