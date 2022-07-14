"use strict";
// This file contains the logic for the booking page.
(function() {
    const MAX_LANES = 5;

    const DEFAULT_NUM_LANES = 1;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

    let booker;

    //TODO: remove this
    // This funcitons simulates the GetTimes api call that should be made after the user hits the next button on the date time picker.
    // Once that API is actually written, it should replace this function, but till then, it's a "fake" api call
    function getBusinessInfo() {
        return {
            openingTime: 0,
            closingTime: 23,
            availableHours: [
                {
                    hours: 8,
                    minutes: 0,
                    isPm: false
                },
                {
                    hours: 9,
                    minutes: 0,
                    isPm: false
                },
                {
                    hours: 10,
                    minutes: 0,
                    isPm: false
                },
                {
                    hours: 11,
                    minutes: 0,
                    isPm: false
                },
                {
                    hours: 12,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 1,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 2,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 3,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 4,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 5,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 6,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 7,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 8,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 1,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 2,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 3,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 4,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 5,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 6,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 7,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 8,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 1,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 2,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 3,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 4,
                    minutes: 30,
                    isPm: true 
                },
                {
                    hours: 5,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 6,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 7,
                    minutes: 30,
                    isPm: true
                },
                {
                    hours: 8,
                    minutes: 30,
                    isPm: true
                }
            ]
        };
    }


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

    function addZero(num) {
        let ret = num.toString();
        if (ret.length < 2) {
            return '0' + ret;
        }
        return ret;
    }

    // Takes a int hours and int minutes and converts to string representation of time HH:MM
    // Time will be displayed in 12 hour format.
    function numToTime(h, m) {
        let n = h % 12;
        if (n === 0) {
            n = 12;
        }
        return n + ':' + addZero(m);
    }

    // takes a time string in HH:MM format and a boolean isPm, returns object.
    function timeToNum(t, isPm) {
        t = t.split(':');
        return {
            hours: parseInt(t[0]),
            minutes: parseInt(t[1]),
            isPm: isPm
        };
    }

    function addLabel(str, container) {
        let label = document.createElement('h2');
        label.textContent = str;
        container.appendChild(label);
    }

    function appendTilesToCalendar(cal) {
        // first add the column headers, then the regular tiles
        ['Sat', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sun'].forEach(function(elem) { 
            let calColHeader = document.createElement('div');
            calColHeader.classList.add('calColHeader');
            calColHeader.textContent = elem;
            cal.append(calColHeader);
        });
        for (let i = 0; i < 35; i++) { // add regular calendar tiles
            let calTile = createElem('div', '.calTile');
            calTile.textContent = '';
            cal.append(calTile);
        }
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
        let cal = booker.calState;
        cal.selectedYear = cal.curYear;
        cal.selectedMonth = cal.curMonth;
        cal.selectedDate = parseInt(this.textContent); 
        updateCalSelectedDate();
    }

    function updateCalSelectedDate() {
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
        updateCalSelectedDate();

        // Now render the calendar for the current month/year
        let tiles = document.querySelectorAll('.calTile');
        let dayOffset = new Date(cal.curYear, cal.curMonth).getDay();
        let daysInMonth = 32 - (new Date(cal.curYear, cal.curMonth, 32)).getDate();
        for (let i = 0; i < tiles.length; i++) {
            if (i >= dayOffset && i - dayOffset < daysInMonth) {
                if (tiles[i].textContent === '') {
                    tiles[i].addEventListener('click', onCalDayClick);
                    tiles[i].classList.add('clickableTile');
                }
                tiles[i].textContent = i - dayOffset + 1;
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
        appendTilesToCalendar(calGrid)
        calGrid.append(prevMonthButton, monthYearDisplay, nextMonthButton);

        return calGrid;

    }

    function createLanePicker() {
        // Create display for currently selected number of lanes.
        let laneNumDisplay = createElem('div', '#laneNumDisplay');

        // Create button for increasing the number of lanes
        let nextLaneButton = createElem('div', '#nextLaneButton');
        nextLaneButton.classList.add('laneButton');
        nextLaneButton.textContent = '>';
        nextLaneButton.addEventListener('click', function() {
            let curLane = booker.laneState.num;
            if (curLane < MAX_LANES) {
                booker.laneState.num++;
                $('laneNumDisplay').textContent = (curLane + 1).toString();
            }
        });

        // Create button for decreasing the number of lanes.
        let prevLaneButton = createElem('div', '#prevLaneButton');
        prevLaneButton.classList.add('laneButton');
        prevLaneButton.textContent = '<';
        prevLaneButton.addEventListener('click', function() {
            let curLane = booker.laneState.num;
            if (curLane > 1) {
                booker.laneState.num--;
                $('laneNumDisplay').textContent = (curLane - 1).toString();
            }
        });

        // Create container to hold these elements
        let lanePickerContainer = createElem('div', '#laneNumPickerContainer');
        lanePickerContainer.append(prevLaneButton, laneNumDisplay, nextLaneButton);
        return lanePickerContainer;
    }

    function createSubmitDateLaneButton() {
        let submitDateLaneButton = createElem('div', '#nextBookerButton');
        submitDateLaneButton.classList.add('bookerButton');
        submitDateLaneButton.textContent = 'Next';
        submitDateLaneButton.addEventListener('click', function() {
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

    function Booker(o) {
        this.initDateLanePicker = function() {
            // Create a div to hold both the calendar and lane picker.
            let dateLanePicker = createElem('div', '#dateLanePicker');
            this.elem.appendChild(dateLanePicker);

            // Add date picker label and calendar/datepicker
            addLabel('Please select a date below for your booking', dateLanePicker);
            dateLanePicker.append(createCalendar());

            // Set the state of the calendar.
            let todaysDate = new Date();
            this.calState = {
                selectedYear: todaysDate.getFullYear(),
                selectedMonth: todaysDate.getMonth(),
                selectedDate: todaysDate.getDate(),
                curMonth: todaysDate.getMonth(),
                curYear: todaysDate.getFullYear()
            }
            renderCalendar();

            // Add lane picker label, and lane picker
            addLabel('How many lanes would you like to book?', dateLanePicker);
            dateLanePicker.append(createLanePicker());

            // Set the state of the lane picker.
            booker.laneState = {
                num: DEFAULT_NUM_LANES
            }
            $('laneNumDisplay').textContent = DEFAULT_NUM_LANES.toString();

            // Add the button to submit date and lane choices and move to the next stage of booking.
            dateLanePicker.append(createSubmitDateLaneButton());
        }

        this.init = function() {
            this.elem = o.elem;
            this.initDateLanePicker();
        }

        this.initTimePicker = function() {
            let timePickerContainer = createElem('div', '#timePickerContainer');
            
        }

        this.showTimePicker = function() {
            this.businessInfo = getBusinessInfo();
            this.dateLanePicker.style.display = 'none';
            let timePickerContainer = createElem('div', '#timePickerContainer');
            addLabel('What time would you like your booking to start?', timePickerContainer);
            this.initTimePicker(timePickerContainer);
            this.initSubmitBookerButton(timePickerContainer);
            this.timePicker = timePickerContainer;
            this.elem.appendChild(timePickerContainer);
        }

        this.initTimePicker = function(container) {
            let timeGrid = createElem('div', '#timeGrid');
            let selectedTimeDisplay = createElem('div', '#selectedTimeDisplay');
            let amButton = createElem('div', '#amButton');
            amButton.setAttribute('class', 'timeButton');
            let pmButton = createElem('div', '#pmButton');
            pmButton.setAttribute('class', 'timeButton');
            let innerTimeGridContainer = createElem('div', '#innerTimeGridContainer');
            let innerTimeGrid = createElem('div', '#innerTimeGrid');

            selectedTimeDisplay.textContent = "Your Selected Time is: ";
            amButton.textContent = 'AM';
            amButton.addEventListener('click', this.onAmPmClick);
            pmButton.textContent = 'PM';
            timeGrid.append(selectedTimeDisplay);
            /*
            for (let i = 0; i < 12; i++) {
                let timeTile = createElem('div', '.timeTile');
                timeTile.textContent = '';
                innerTimeGrid.append(timeTile);
            }*/
            innerTimeGridContainer.append(innerTimeGrid);
            timeGrid.append(innerTimeGridContainer);
            timeGrid.append(amButton, pmButton);
            this.timeGrid = innerTimeGrid;
            this.selectedTimeDisplay = selectedTimeDisplay;
            this.amButton = amButton;
            this.pmButton = pmButton;
            container.append(timeGrid);
            //TODO: select default date, also change how this is done in calendar?
            this.isPm = true;
            this.showTimes();
        }

        this.onAmPmClick = function() {
            this.removeEventListener('click', booker.onAmPmClick);
            if (this == booker.amButton) {
                booker.isPm = false;
                booker.pmButton.addEventListener('click', booker.onAmPmClick);
                booker.showTimes();
            } else {
                booker.isPm = true;
                booker.amButton.addEventListener('click', booker.onAmPmClick);
                booker.showTimes();
            }
        }

        // Requires booker.isPm to be set before this is called.
        this.showTimes = function() {
            let tiles = this.timeGrid.querySelectorAll('.timeTile');
            let hrs = this.businessInfo.availableHours;
            for (let i = 0; i < hrs.length; i++) {
                let tile;
                if (i >= tiles.length) {
                    // need to make a new tile
                    tile = createElem('div', '.timeTile');
                    tile.textContent = '';
                    this.timeGrid.append(tile);
                } else {
                    tile = tiles[i];
                }
                if (hrs[i].isPm === this.isPm) {
                    if (tile.textContent == '') {
                        tile.addEventListener('click', this.onTimeTileClick);
                        tile.classList.add('clickableTile');
                    }
                    tile.textContent = numToTime(hrs[i].hours, hrs[i].minutes);
                } else {
                    if (tile.textContent != '') {
                        tile.removeEventListener('click', this.onTimeTileClick);
                        tile.classList.remove('clickableTile');
                    }
                    tile.textContent = '';
                }
            }
        }
            

        // Again, 'this' refers to the clicked on div here.
        this.onTimeTileClick = function() {
            booker.selectTime(timeToNum(this.textContent, booker.isPm));
        }

        this.selectTime = function(t) {
            this.selectedTime = t;
            console.log('user selected Time: ');
            console.log(t);
            console.log(booker);
        }

        // Again, 'this' refers to the clicked on div here.
        this.initSubmitBookerButton = function(container) {
            let submitBookerButton = createElem('div', '#submitBookerButton');
            submitBookerButton.classList.add('bookerButton');
            submitBookerButton.textContent = 'Submit';
            submitBookerButton.addEventListener('click', function() {
                // TODO: this is completely broken
                let sel = booker.cal.selectedDate;
                console.log("User selected: " + monthNames[sel.month] + " " + sel.day + " " + sel.year);
            });
            container.appendChild(submitBookerButton);
        }            
    }

    window.addEventListener('load', function() {
        booker = new Booker({
            elem: $('bookingContainer')
        });
        booker.init();
        console.log(booker);
    });
})();
