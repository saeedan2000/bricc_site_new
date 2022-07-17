"use strict";
// This file contains the logic for the booking page.
(function() {

    // as of now not planning to get this from backend, not something likely to change.
    const MAX_LANES_PER_BOOKING = 5;

    const DEFAULT_NUM_LANES = 1;

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
            lanes: [1, 2],
            date: '2022-7-16',
            startTime: {
                hours: 6,
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
            lanes: [3, 4],
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
        let nextLaneButton = document.createElement('div');
        nextLaneButton.classList.add('incDecButton');
        nextLaneButton.textContent = '>';
        nextLaneButton.addEventListener('click', function() {
            if (booker.laneState.num < MAX_LANES_PER_BOOKING) {
                booker.laneState.num++;
                renderLanePicker()
            }
        });

        // Create button for decreasing the number of lanes.
        let prevLaneButton = document.createElement('div');
        prevLaneButton.classList.add('incDecButton');
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
        let submitDateLaneButton = document.createElement('div');
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
            console.log("Submitted Date/Lane: ");
            console.log(submitData);
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

    // Probably doesn't need it's own function, but in keeping with the pattern.
    function renderNumHoursPicker() {
        $('numHoursDisplay').textContent = booker.timeState.numHours.toString();
    }

    // closely matches lanepicker
    function createNumHoursPicker() {
        let numHoursDisplay = createElem('div', '#numHoursDisplay');

        let nextHourButton = document.createElement('div'); // maybe remove id for corresponding button for lane picker
        nextHourButton.classList.add('incDecButton');
        nextHourButton.textContent = '>';
        nextHourButton.addEventListener('click', function() {
            if (booker.timeState.numHours < booker.timeState.initData.maxBookingLength) {
                booker.timeState.numHours++;
                renderNumHoursPicker()
            }
        });

        let prevHourButton = document.createElement('div');
        prevHourButton.classList.add('incDecButton');
        prevHourButton.textContent = '<';
        prevHourButton.addEventListener('click', function() {
            if (booker.timeState.numHours > 1) {
                booker.timeState.numHours--;
                renderNumHoursPicker()
            }
        });

        // Create container to hold these elements
        let numHoursPickerContainer = createElem('div', '#laneNumPickerContainer');
        numHoursPickerContainer.append(prevHourButton, numHoursDisplay, nextHourButton);
        return numHoursPickerContainer;
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

    function createSubmitTimeButton() {
        let submitTimeButton = document.createElement('div'); 
        submitTimeButton.classList.add('bookerButton');
        submitTimeButton.textContent = 'Next';
        submitTimeButton.addEventListener('click', function() {
            booker.overallState = State.BOOKABLE_SCREEN;
            renderBooker();

            // temp logging
            let submittedDate = {
                year: booker.calState.selectedYear,
                month: booker.calState.selectedMonth,
                date: booker.calState.selectedDate
            }
            let submitData = {
                date: submittedDate,
                lane: booker.laneState.num,
                time: booker.timeState.selectedTime,
                numHours: booker.timeState.numHours
            }
            console.log("Submitted Date/Lane/Time: ");
            console.log(submitData);
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
        console.log(slotKeyGen(data));
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

        let num = document.createElement('h2');
        num.textContent = 'Net(s) ' + slot.lanes.join(', ');

        let time = document.createElement('h2');
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
        if (booker.bookState == null) {
            booker.bookState = {
                slots: response,
                selected: new Set()
            };
        } else {
            booker.bookState.slots = response;
        }

        booker.initSlotPicker();
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

            // Add lane picker label, and lane picker
            addLabel('How many lanes would you like to book?', dateLanePickerContainer);
            dateLanePickerContainer.append(createLanePicker());
            renderLanePicker(); // render as above

            // Add the button to submit date and lane choices and move to the next stage of booking.
            dateLanePickerContainer.append(createSubmitDateLaneButton());
        }

        this.initTimePicker = function() {
            let timePickerAndSubmitContainer = document.createElement('div');
            this.elem.append(timePickerAndSubmitContainer);

            // Add time picker label and the time picker itself.
            addLabel('What time would you like your booking to start?', timePickerAndSubmitContainer);
            timePickerAndSubmitContainer.append(createTimePicker());

            // render based on timeState which should already be set.
            renderTimePicker();

            // Add booking length picker along with a label.
            addLabel('How many hours would you like to book?', timePickerAndSubmitContainer);
            timePickerAndSubmitContainer.append(createNumHoursPicker());
            renderNumHoursPicker(); //render as above

            // Add the button to submit the date, lane, and time choices and move on.
            timePickerAndSubmitContainer.append(createSubmitTimeButton());

            // Add the button to return to the date/lane pickers.
            timePickerAndSubmitContainer.append(createReturnToDateLaneButton());
        }

        this.initSlotPicker = function() {
            let slotPickerAndSubmitContainer = document.createElement('div');
            this.elem.append(slotPickerAndSubmitContainer);
            
            // Add label. Most of the construction is tile-by-tile, so no 
            // createBookablePicker()
            addLabel('Please select from the slots we have available: ', slotPickerAndSubmitContainer);
            slotPickerAndSubmitContainer.append(createElem('div','#slotPickerContainer'));
            renderSlotPicker();

            // TODO
            // render based on bookState which should already be set.
            // Add the button to move forward.
            // Add the button to return to time picker.
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

    window.addEventListener('load', function() {
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
                num: DEFAULT_NUM_LANES
            },
            timeState: null,
            bookState: null,
            overallState: State.DATE_LANE_SCREEN
        });
        booker.init($('bookingContainer'));
    });
})();
