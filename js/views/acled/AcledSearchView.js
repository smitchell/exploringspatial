/**
 * The purpose of the MapSearchView is to control user interaction with the map search filter.
 */
define([
    'underscore',
    'backbone',
    'collections/CodeDefinitions',
    'text!templates/acled/AcledSearchView.html',
    'jquery-ui'
], function(_, Backbone, CodeDefinitions, templateHtml) {

    var MapSearchView = Backbone.View.extend({

        events: {
            'click .searchButton a' : 'search',
            'blur #country' : 'onBlur',
            'blur #location' : 'onBlur',
            'blur #actorType' : 'onBlur',
            'blur #eventType' : 'onBlur',
            'click #showTrigger' : 'expandSearch',
            'click #hideTrigger' : 'collapseSearch'
        },

        initialize: function(args) {
            this.template = _.template(templateHtml);
            this.countries = args.countries;
            this.countriesJSON = this.extractLabelValuePairs(this.countries);
            this.locationsJSON = [];
            this.eventsJSON = [];
            this.actorsJSON = [];
            this.mapProviders = args.mapProviders;
            this.actorTypes = new CodeDefinitions('ACTOR_TYPE');
            this.eventTypes = new CodeDefinitions('EVENT_TYPE');
            this.locations = new CodeDefinitions('LOCATION');
            this.render();
        },
        
        loadData: function() {
            var _self = this;
            this.actorTypes.fetch({success: function() {
                _self.actorsJSON = _self.extractLabelValuePairs(_self.actorTypes);
                $('#actorType').autocomplete(_self.autoCompleteOptions('actorType'));
            }});
            this.eventTypes.fetch({success: function() {
                _self.eventsJSON = _self.extractLabelValuePairs(_self.eventTypes);
                $('#eventType').autocomplete(_self.autoCompleteOptions('eventType'));
            }});
            this.locations.fetch({success: function() {
                _self.locationsJSON = _self.extractLabelValuePairs(_self.locations);
                $('#location').autocomplete(_self.autoCompleteOptions('location'));
            }});
        },
        
        extractLabelValuePairs: function(codeDefinitions) {
            var labelValuePairs = [];
            codeDefinitions.each( function(codeDefinition) {
                labelValuePairs.push({
                    label: codeDefinition.get('definition'),
                    value: codeDefinition.get('codeDefinitionPk')
                });
                
            });
            return labelValuePairs;
        },

        render: function() {
            var html = this.template();
            jQuery(this.el).html(html);
            $('#minDate').datepicker({
                dateFormat: 'mm/dd/yy',
                minDate: '01/01/1971',
                maxDate: '12/31/2014',
                changeMonth: true,
                changeYear: true,
                selectOtherMonths: true,
                showOtherMonths: true,
                showStatus: true,
                onClose: function() {
                    this.focus();
                }
            });
            $('#maxDate').datepicker({
                dateFormat: 'mm/dd/yy',
                minDate: '01/01/1971',
                maxDate: '12/31/2014',
                changeMonth: true,
                changeYear: true,
                selectOtherMonths: true,
                showOtherMonths: true,
                showStatus: true,
                onClose: function() {
                    this.focus();
                }
            });
            $('#country').autocomplete(this.autoCompleteOptions('country'));
            this.loadData();
        },
        
        autoCompleteOptions: function(fieldId) {
            var json, $pk;
            var $input = $('#' + fieldId);
            switch (fieldId) {
                case 'country':
                    json = this.countriesJSON;
                    $pk = $('#country_pk');
                    break;
                case 'location':
                    json = this.locationsJSON;
                    $pk = $('#location_pk');
                    break;
                case 'actorType':
                    json = this.actorsJSON;
                    $pk = $('#actor_type_pk');
                    break;
                case 'eventType':
                    json = this.eventsJSON;
                    $pk = $('#event_type_pk');
                    break;
                default:
                    return new Error('Unknown autocomplete field: ' + event.target.id);
            }
            return  {
                minLength: 0,
                source: json,
                focus: function (event, ui) {
                    $input.val(ui.item.label);
                },
                select: function (event, ui) {
                    $input.val(ui.item.label);
                    $pk.val(ui.item.value);
                    return false;
                }
            };
        },

        search: function() {
            var $searchButtonProgress = this.$('#searchButtonProgress');
            // No searching while a search is in progress
            if ($searchButtonProgress.is(':hidden')) {
                var properties = {};
                var curVal = $('#country_pk').val();
                properties.countryPk = Number(curVal);
                properties.locationPk = Number($('#location_pk').val());
                properties.actorTypePk = Number($('#actor_type_pk').val());
                properties.eventTypePk = Number($('#event_type_pk').val());
                var input = this.scrubInput(this.$('#minFatalities').val());
                if (input.length == 0 || isNaN(input)) {
                    properties.minFatalities = '';
                } else {
                    properties.minFatalities = Number(input);
                }
                input = this.scrubInput(this.$('#maxFatalities').val());
                if (input.length == 0 || isNaN(input)) {
                    properties.maxFatalities = '';
                } else {
                    properties.maxFatalities = Number(input);
                }
                properties.minDate = this.parseDate(this.scrubInput(this.$('#minDate').val()));
                properties.maxDate = this.parseDate(this.scrubInput(this.$('#maxDate').val()));
                this.model.set(properties);
            }
        },

        scrubInput: function(value) {
            var scrubbed = '';
            if (typeof value != 'undefined' && value != null) {
                scrubbed = value.trim();
                if (scrubbed.length > 0) {
                    scrubbed = scrubbed.split('<').join('');
                    scrubbed = scrubbed.split('>').join('');
                }
            }
            return scrubbed;
        },

        expandSearch: function() {
            this.$('#showTrigger').hide();
            this.$('#hideTrigger').show();
            this.$('.expandedSearchFilters').slideDown();
        },

        collapseSearch: function() {
            this.$('#hideTrigger').hide();
            this.$('#showTrigger').show();
            this.$('.expandedSearchFilters').slideUp();
        },

        parseDate: function(value) {
            if (value != null && value.length > 0) {
                var parts = value.split('/');
                if (parts.length = 3) {
                    return new Date(parts[2], parts[0] - 1, parts[1]);
                }
            }
            return '';
        },

        /**
         * Handle garbage typed into the field that was not selected from the autocomplete list.
         * * 
         * @param event - The blur event.
         * @returns {Error}
         */
        onBlur: function(event) {
            var collection, $pk;
            var $target = $(event.target);
            switch(event.target.id) {
                case 'country':
                    collection = this.countries;
                    $pk = $('#country_pk');
                    break;
                case 'location':
                    collection = this.locations;
                    $pk = $('#location_pk');
                    break;
                case 'actorType':
                    collection = this.actorTypes;
                    $pk = $('#actor_type_pk');
                    break;
                case 'eventType':
                    collection = this.eventTypes;
                    $pk = $('#event_type_pk');                       break;
                default:
                    return new Error('Unknown autocomplete field: ' + event.target.id);
            }
            var value = this.scrubInput($target.val());
            if (value != null && value.length > 0) {
                // This will normally already be set, but only if the pick a valid definition from the list.
                // Otherwise, this line of code will set it to null.
                var codeDefinition = collection.findByDefinition(value);
                if (codeDefinition == null) {
                    $pk.val(-1);
                } else {
                    $pk.val(codeDefinition.get('codeDefinitionPk'));
                }
            } else {
                $pk.val(-1);
            }
            if ($pk.val() == -1) {
                $target.val('');
            }
        }


    });

    return MapSearchView;
});
