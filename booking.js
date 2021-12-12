"use strict";
// This file contains the logic for the booking page.
(function() {
    let booker;

    //TODO: remove this
    // This funcitons simulates the GetTimes api call that should be made after the user hits the next button on the date time picker.
    // Once that API is actually written, it should replace this function, but till then, it's a "fake" api call
    function getTimes() {
        return {
            businessHours: {
                openingTime: 8,
                closingTime: 22
            },
            blockedHours: []
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
    function numToTime(h, m) {
        let n = h % 12;
        return n + ':' + addZero(m);
    }

    function timeToNum(t) {
        t = t.split(':');
        return {
            hours: parseInt(t[0]),
            minutes: parseInt(t[1])
        };
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
                    }
                    tiles[i].textContent = i - dayOffset + 1;
                } else {
                    if (tiles[i].textContent !== '') {
                        tiles[i].removeEventListener('click', this.onCalTileClick);
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
            //this.addLabel('Please select a date below for your booking.');
            this.initDateLanePicker();
            //this.addLabel('How many lanes would you like to book?');
            //this.initLanePicker();
            //this.addLabel('What time would you like your booking to start?');
            //this.initTimePicker();
        }

        this.initTimePicker = function() {
            let timePickerContainer = createElem('div', '#timePickerContainer');
            
        }

        this.addLabel = function(str, container) {
            let label = document.createElement('h2');
            label.textContent = str;
            container.appendChild(label);
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
            this.addLabel('Please select a date below for your booking', dateLanePicker);
            this.cal = new Calendar({
                pickerElem: dateLanePicker,
                todaysDate: new Date()
            });
            this.addLabel('How many lanes would you like to book?', dateLanePicker);
            this.initLanePicker(dateLanePicker);
            this.initNextBookerButton(dateLanePicker);
                        
            this.elem.appendChild(dateLanePicker);
            this.dateLanePicker = dateLanePicker;
        }

        this.showTimePicker = function() {
            this.dateLanePicker.style.display = 'none';
            let timePickerContainer = createElem('div', '#timePickerContainer');
            this.addLabel('What time would you like your booking to start?', timePickerContainer);
            this.initTimePicker(timePickerContainer);
            this.initSubmitBookerButton(timePickerContainer);
            this.timePicker = timePickerContainer;
            this.elem.appendChild(timePickerContainer);
        }

        this.initTimePicker = function(container) {
            console.log('initializing time picker');
            this.timeInfo = getTimes();

            let timeGrid = createElem('div', '#timeGrid');
            let selectedTimeDisplay = createElem('div', '#selectedTimeDisplay');
            let amButton = createElem('div', '#amButton');
            amButton.setAttribute('class', 'timeButton');
            let pmButton = createElem('div', '#pmButton');
            pmButton.setAttribute('class', 'timeButton');

            selectedTimeDisplay.textContent = "Your Selected Time is: ";
            amButton.textContent = 'AM';
            amButton.addEventListener('click', this.showAm);
            pmButton.textContent = 'PM';
            pmButton.addEventListener('click', this.showPm);
            timeGrid.append(selectedTimeDisplay);
            
            let amMax = Math.min(this.timeInfo.businessHours.closingTime, 10);
            for (let i = 0; i < 12; i++) {
                let timeTile = createElem('div', '.timeTile');
                timeTile.testContent = '';
                timeGrid.append(timeTile);
            }
            timeGrid.append(amButton, pmButton);
            this.timeGrid = timeGrid;
            this.selectedTimeDisplay = selectedTimeDisplay;
            this.amButton = amButton;
            this.pmButton = pmButton;
            container.append(timeGrid);
            //TODO: select default date, also change how this is done in calendar?
            this.showAm();
        }

        // Again, 'this' refers to the clicked on div here.
        this.showAm = function() {
            let start = booker.timeInfo.businessHours.openingTime;
            let end = Math.min(booker.timeInfo.businessHours.closingTime - 1, 10);
            booker.showTimes(start, end); 
        }

        //TODO: write on onclick and hand it between showpm and show am.
        this.showPm = function() {
            let start = Math.max(booker.timeInfo.businessHours.openingTime, 11);
            let end = Math.min(booker.timeInfo.businessHours.closingTime - 1, 22)
            //TODO: make time info global and think about async ness
            booker.showTimes(start, end);
        }

        this.showTimes = function(start, end) {
            //TODO: timeTile and calTile are prob unnecessary
            let tiles = this.timeGrid.querySelectorAll('.timeTile');
            for (let i = 0; i < tiles.length; i++) {
                if (i + 11 >= start && i <= end) {
                    if (tiles[i].textContent == '') {
                        tiles[i].addEventListener('click', this.onTimeTileClick);
                    }
                    tiles[i].textContent = numToTime(i, 0);
                } else {
                    if (tiles[i].textContent != '') {
                        tiles[i].removeEventListener('click', this.onTimeTileClick);
                    }
                    tiles[i].textContent = '';
                }
            }
        }
            

        // Again, 'this' refers to the clicked on div here.
        this.onTimeTileClick = function() {
            booker.selectTime(timeToNum(this.textContent));
        }

        this.selectTime = function(t) {
            console.log('user selected Time: ');
            console.log(t);
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
