;(function() {

    function Multiselect() {
        this.selectBoxes = document.querySelectorAll('select.js_multiselect');
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
            document.getElementsByTagName('body')[0].addEventListener('click', this.closeOtherMultiselectOptions);
            document.querySelector("[data-key='js_close_select']").addEventListener('click', this.closeOtherMultiselectOptions);
        },

        createMultiSelectContent: function(selectBox, order)
        {
            selectBox.insertAdjacentHTML('afterend', this.getMultiSelectHtml(selectBox, order));
        },

        getMultiSelectHtml: function(selectBox, order)
        {
            var allOptions = selectBox.options;
            var selectedOptions = this.getSelectedOptions(allOptions);

            var html = '<div data-order="' + order +'" class="multiselect_custom js_multiselect_wrapper">';
            html += '<button type="button" title="' + selectedOptions +'" class="js_multiselect_button multiselect_button"><span class="multiselect_selected">' + selectedOptions +'</span></button>';
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
            return selectedOptions;
        },

        attachEventListeners: function(selectBox)
        {
            var contentHolder = selectBox.nextElementSibling.querySelector('.js_multiselect_list_holder');
            var button = selectBox.nextElementSibling.querySelector('.js_multiselect_button');

            button.addEventListener('click', this.toggleOptionsList.bind(this, contentHolder));

            var options   = contentHolder.querySelectorAll('li');
            for (var i = 0; i < options.length; i++) {
                options[i].dataset.key === 'js_reset'
                    ? options[i].addEventListener('click', this.resetOptions.bind(this, options, selectBox))
                    : options[i].addEventListener('click', this.toggleOption.bind(this, options[i]));
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
                this.closeOtherMultiselectOptions()
            }
            event.stopPropagation();
            contentHolder.classList.toggle('open');
        },

        closeOtherMultiselectOptions: function()
        {
            Array.apply(null, document.getElementsByClassName('js_multiselect_list_holder'))
                .filter(function(holder){
                    return holder.classList.contains("open");
                })
                .map(function(holder){
                    return holder.classList.remove("open");
                });
        },

        toggleOption: function(option, event)
        {
            event.stopPropagation();
            option.classList.toggle('selected');
            this.updateSelectBox(option)
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
            this.updateMultiSelectButton(this.selectBoxes.item(order))
        },

        updateMultiSelectButton: function(selectBox)
        {
            var selectedOptions = this.getSelectedOptions(selectBox.options);
            var button = selectBox.nextElementSibling.querySelector('.js_multiselect_button');
            button.querySelector('span').innerHTML = selectedOptions;
            button.title = selectedOptions;
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