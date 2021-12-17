"use strict";
// This file contains the logic for the booking page.
(function() {
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


    function Calendar(o) {
        this.init = function() {
            this.options = o;

            let calGrid = createElem('div', '#calGrid');
            let selectedDateDisplay = createElem('div', '#selectedDateDisplay');
            let prevMonthButton = createElem('div', '#prevMonthButton');
            prevMonthButton.setAttribute('class', 'calButton');
            let nextMonthButton = createElem('div', '#nextMonthButton');
            nextMonthButton.setAttribute('class', 'calButton');
            let monthYearDisplay = createElem('div', '#monthYearDisplay');
            // set onclicks and whatnot of next/prev, maybe some logic for selected, set up grid
            selectedDateDisplay.textContent = "Your Selected Date is: ";
            prevMonthButton.textContent = 'Prev';
            prevMonthButton.addEventListener('click', this.showPrevMonth);
            nextMonthButton.textContent = 'Next';
            nextMonthButton.addEventListener('click', this.showNextMonth);
            calGrid.append(selectedDateDisplay);
            ['Sat', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sun'].forEach(function(elem) {
                let calColHeader = document.createElement('div');
                calColHeader.classList.add('calColHeader');
                calColHeader.textContent = elem;
                calGrid.append(calColHeader);
            });
            for (let i = 0; i < 35; i++) {
                let calTile = createElem('div', '.calTile');
                calTile.textContent = '';
                calGrid.append(calTile);
            }
            calGrid.append(prevMonthButton, monthYearDisplay, nextMonthButton);
            this.calGrid = calGrid;
            this.selectedDateDisplay = selectedDateDisplay;
            this.monthYearDisplay = monthYearDisplay;
            this.options.pickerElem.append(calGrid);
            this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];
            let todaysDate = this.options.todaysDate;
            this.selectDate(todaysDate.getFullYear(), todaysDate.getMonth(), todaysDate.getDate());
            this.curMonth = todaysDate.getMonth();
            this.curYear = todaysDate.getFullYear();
            this.renderMonth(todaysDate.getFullYear(), todaysDate.getMonth());
        }

        // This function is the onclick for a valid calendar tile. It calls select date. When this function
        // is called (when the user clicks on a tile), 'this' will refer to the tile being clicked on, not cal.
        this.onCalTileClick = function() {
            booker.cal.selectDate(booker.cal.curYear, booker.cal.curMonth, parseInt(this.textContent));
        }

        // Again, 'this' refers to the clicked on div here.
        this.showPrevMonth = function() {
            if (booker.cal.curMonth == 0) {
                booker.cal.curYear--;
                booker.cal.curMonth = 11;
            } else {
                booker.cal.curMonth--;
            }
            booker.cal.renderMonth(booker.cal.curYear, booker.cal.curMonth);
        }

        // Again, 'this' refers to the clicked on div here.
        this.showNextMonth = function() {
            if (booker.cal.curMonth == 11) {
                booker.cal.curYear++;
                booker.cal.curMonth = 0;
            } else {
                booker.cal.curMonth++;
            }
            booker.cal.renderMonth(booker.cal.curYear, booker.cal.curMonth);
        }

        // takes a month (0-11) and a year and renders the calendar
        this.renderMonth = function(year, month) {
            this.monthYearDisplay.textContent = this.monthNames[month] + ' ' + year;
            let tiles = this.calGrid.querySelectorAll('.calTile');
            let dayOffset = new Date(year, month).getDay();
            let daysInMonth = 32 - (new Date(year, month, 32)).getDate();
            for (let i = 0; i < tiles.length; i++) {
                if (i >= dayOffset && i - dayOffset < daysInMonth) {
                    if (tiles[i].textContent === '') {
                        tiles[i].addEventListener('click', this.onCalTileClick);
                        tiles[i].classList.add('clickableTile');
                    }
                    tiles[i].textContent = i - dayOffset + 1;
                } else {
                    if (tiles[i].textContent !== '') {
                        tiles[i].removeEventListener('click', this.onCalTileClick);
                        tiles[i].classList.remove('clickableTile');
                    }
                    tiles[i].textContent = '';
                }
            }
        }

        // Assumes int year, month, date
        this.selectDate = function(year, month, date) {
            this.selectedDate = {
                year: year,
                month: month,
                day: date
            }
            this.selectedDateDisplay.textContent = 'Selected Date: ' + (month + 1) + '/' + date + '/' + year;
        }

        this.init();
    }

    function Booker(o) {
        this.init = function() {
            this.options = o;
            this.elem = $(this.options.id);
            this.initDateLanePicker();
        }

        this.initTimePicker = function() {
            let timePickerContainer = createElem('div', '#timePickerContainer');
            
        }

        this.initLanePicker = function(container) {
            let lanePickerContainer = createElem('div', '#laneNumPickerContainer');
            let prevLaneButton = createElem('div', '#prevLaneButton');
            prevLaneButton.classList.add('laneButton');
            prevLaneButton.textContent = '<';
            let nextLaneButton = createElem('div', '#nextLaneButton');
            nextLaneButton.classList.add('laneButton');
            nextLaneButton.textContent = '>';
            let laneNumDisplay = createElem('div', '#laneNumDisplay');
            laneNumDisplay.textContent = '1';
            this.selectedLaneNum = 1;
            this.laneNumDisplay = laneNumDisplay;
            prevLaneButton.addEventListener('click', function() {
                let curLane = parseInt(booker.laneNumDisplay.textContent);
                if (curLane != 1) {
                    booker.laneNumDisplay.textContent = (curLane - 1).toString();
                    booker.selectedLaneNum = curLane - 1;
                }
            });
            nextLaneButton.addEventListener('click', function() {
                let curLane = parseInt(booker.laneNumDisplay.textContent);
                if (curLane != 5) {
                    booker.laneNumDisplay.textContent = (curLane + 1).toString();
                    booker.selectedLaneNum = curLane + 1;
                }
            });
            lanePickerContainer.appendChild(prevLaneButton);
            lanePickerContainer.appendChild(laneNumDisplay);
            lanePickerContainer.appendChild(nextLaneButton);
            container.appendChild(lanePickerContainer);
        }

        this.initNextBookerButton = function(container) {
            let nextBookerButton = createElem('div', '#nextBookerButton');
            nextBookerButton.classList.add('bookerButton');
            nextBookerButton.textContent = 'Next';
            nextBookerButton.addEventListener('click', function() {
                booker.showTimePicker();
            });
            container.appendChild(nextBookerButton);
        }

        this.initDateLanePicker = function() {
            let dateLanePicker = document.createElement('div');
            dateLanePicker.id = 'dateLanePicker';
            // Add date picker label
            addLabel('Please select a date below for your booking', dateLanePicker);
            this.cal = new Calendar({
                pickerElem: dateLanePicker,
                todaysDate: new Date()
            });
            addLabel('How many lanes would you like to book?', dateLanePicker);
            this.initLanePicker(dateLanePicker);
            this.initNextBookerButton(dateLanePicker);
                        
            this.elem.appendChild(dateLanePicker);
            this.dateLanePicker = dateLanePicker;
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
                // TODO:
                let sel = booker.cal.selectedDate;
                console.log("User selected: " + booker.cal.monthNames[sel.month] + " " + sel.day + " " + sel.year);
            });
            container.appendChild(submitBookerButton);
        }            

        this.init();
    }

    window.addEventListener('load', function() {
        booker = new Booker({
            id: 'bookingContainer',
        });
        console.log(booker);
    });
})();
