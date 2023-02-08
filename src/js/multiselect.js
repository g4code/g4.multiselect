;(function() {

    function Multiselect(closeMultiselectCallback = undefined) {
        this.selectBoxes = document.querySelectorAll('select.js_multiselect');
        this.closeMultiSelectCallback = closeMultiselectCallback;
        if(this.selectBoxes.length === 0){
            throw "Select boxes not exist";
        }
    }

    Multiselect.prototype = {

        selectBoxes: null,

        make: function()
        {
            for (var i = 0; i < this.selectBoxes.length; i++) {
                this.createMultiSelectContent(this.selectBoxes[i],i);
                this.attachEventListeners(this.selectBoxes[i]);
            }
            document.getElementsByTagName('body')[0].addEventListener('click', this.closeOtherMultiselectOptions.bind(this));
        },

        createMultiSelectContent: function(selectBox, order)
        {
            selectBox.insertAdjacentHTML('afterend', this.getMultiSelectHtml(selectBox, order));
        },

        getMultiSelectHtml: function(selectBox, order)
        {
            var allOptions = selectBox.options;
            var selectedOptions = this.getSelectedOptions(allOptions);
            var selectedOptionsText = selectedOptions.text != undefined ? selectedOptions.text : selectedOptions;
            var selectedOptionsValues = selectedOptions.values != undefined ? selectedOptions.values.toLocaleLowerCase() : selectedOptions;

            var html = '<div data-order="' + order +'" class="multiselect_custom js_multiselect_wrapper">';
            html += '<button type="button" title="'+ selectedOptionsText +'" class="js_multiselect_button multiselect_button" data-selected="'+ selectedOptionsValues  +'"><span class="multiselect_selected">' + selectedOptionsText +'</span></button>';
            html += '<ul class="multiselect_list js_multiselect_list_holder">';
            for (var i = 0; i < allOptions.length; i++) {
                var selectedClassPart = allOptions[i].selected ? ' selected">' : '">';
                html += '<li data-key="' + allOptions[i].value +'" class="multiselect_list_item' + selectedClassPart;
                html += '<a class="multiselect_list_link"><span class="multiselect_list_text">' + allOptions[i].text +'</span> </a>';
                html += '</li>';
            }
            html += '</ul></div>';
            return html;
        },

        getSelectedOptions: function(allOptions)
        {
            var resetOptionText = false;
            var selectedValues = Array.apply(null, allOptions)
                .filter(function(option) {
                    return option.selected;
                })
                .map(function(option) {
                    return option.value;
                })
                .reduce(function(prev, next){
                    return prev + ', ' + next
                }, '')
                .replace(/^,/, '');

            var selectedOptions = Array.apply(null, allOptions)
                .filter(function(option){
                    if(option.value === 'js_reset'){
                        resetOptionText = option.text;
                    }
                    return option.selected;
                })
                .map(function(option){
                    return option.text
                })
                .reduce(function(prev, next){
                    return prev + ', ' + next
                }, '')
                .replace(/^,/, '');

            if(selectedOptions.length === 0 && resetOptionText){
                return resetOptionText;
            }
            
            return {
                text: selectedOptions,
                values: selectedValues
            }
        },

        attachEventListeners: function(selectBox)
        {
            var contentHolder = selectBox.nextElementSibling.querySelector('.js_multiselect_list_holder');
            var button = selectBox.nextElementSibling.querySelector('.js_multiselect_button');

            button.addEventListener('click', this.toggleOptionsList.bind(this, contentHolder));

            var options = contentHolder.querySelectorAll('li');

            selectBox.hasAttribute('multiple') ? this.listenersSelectMultiple(options, selectBox) : this.listenersSelectClassic(options);
        },

        listenersSelectClassic: function(options) {

            for (var i = 0; i < options.length; i++) {
                options[i].addEventListener('click', this.toggleOptionSelect.bind(this, options[i], options));
            }
        },

        listenersSelectMultiple: function(options, selectBox) {
            for (var i = 0; i < options.length; i++) {
                switch (options[i].dataset.key) {
                    case 'js_reset':
                        options[i].addEventListener('click', this.resetOptions.bind(this, options, selectBox));
                        break;
                    case 'js_close_multiselect':
                        options[i].addEventListener('click', this.closeOtherMultiselectOptions);
                        break;
                    default:
                        options[i].addEventListener('click', this.toggleOptionMultiselect.bind(this, options[i]));
                }
            }
        },

        resetOptions: function(list, selectBox)
        {
            Array.apply(null, list).map(function(option){
                return option.classList.remove("selected");
            });
            Array.apply(null, selectBox.options).map(function(option){
                return option.selected = false
            });
            this.updateMultiSelectButton(selectBox);
        },

        toggleOptionsList: function(contentHolder, event)
        {
            if(!contentHolder.classList.contains('open')){
                this.closeOtherMultiselectOptions(event)
            }
            event.stopPropagation();
            contentHolder.classList.toggle('open');
        },

        closeOtherMultiselectOptions: function(event)
        {
            Array.apply(null, document.getElementsByClassName('js_multiselect_list_holder'))
                .filter(function(holder){
                    return holder.classList.contains("open");
                })
                .map(function(holder){
                    return holder.classList.remove("open");
                });
          
            if (!event.currentTarget.classList.contains('js_multiselect_button')) {
                if (typeof this.closeMultiSelectCallback === 'function') {
                    this.closeMultiSelectCallback();
                }
            }
        },

        toggleOptionMultiselect: function(option, event)
        {
            event.stopPropagation();
            option.classList.toggle('selected');
            this.updateSelectBox(option)
        },

        toggleOptionSelect: function(option, options, event) {
            event.stopPropagation();
            options.forEach(function(item) {
                item.classList.remove('selected');
            })
            option.classList.add('selected');
            this.updateSelectBox(option);
            this.closeOtherMultiselectOptions(event);
        },

        updateSelectBox: function(option)
        {
            var order = option.closest('.js_multiselect_wrapper').dataset.order;
            var key =  option.dataset.key;
            var selectOptionForUpdate = Array.apply(null, this.selectBoxes.item(order).options)
                .filter(function(option){
                    return option.value === key
                });
            selectOptionForUpdate[0].selected = !selectOptionForUpdate[0].selected;
            this.updateMultiSelectButton(this.selectBoxes.item(order));
        },

        updateMultiSelectButton: function(selectBox)
        {
            var selectedOptions = this.getSelectedOptions(selectBox.options);
            var button = selectBox.nextElementSibling.querySelector('.js_multiselect_button');
            button.querySelector('span').innerHTML = selectedOptions.text != undefined ? selectedOptions.text : selectedOptions;
            button.title = selectedOptions.text != undefined ? selectedOptions.text : selectedOptions;
            button.setAttribute('data-selected', selectedOptions.values != undefined ? selectedOptions.values.toLocaleLowerCase() : selectedOptions);
        }
    };

    if (typeof define != 'undefined' && define.hasOwnProperty('amd') && define.amd) { // RequireJS AMD
        define(function(){
            return Multiselect;
        });
    }
    else if ((typeof module != 'undefined') && (module.exports)) { // Node Module
        module.exports = Multiselect;
    }
    else if (typeof window != 'undefined') { // Fall back to attaching to window
        window.G4 = typeof G4 != "undefined" ? G4 : {};
        window.G4.multiselect = typeof G4.multiselect != "undefined" ? G4.multiselect : {};
        window.G4.multiselect =  Multiselect;
    }

}.call(this));