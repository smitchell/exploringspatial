/**
 * The purpose of the AcledSearchView is to control user interaction with the map search filter.
 */
define([
    'underscore',
    'backbone',
    'demos/demo6/collections/CodeDefinitions',
    'text!demos/demo6/templates/AcledSearchView.html',
    'jquery-ui'
], function(_, Backbone, CodeDefinitions, templateHtml) {

    var AcledSearchView = Backbone.View.extend({

        events: {
            'click #searchButton' : 'search',
            'change #country_pk' : 'onChangeCountry',
            'blur #actorType' : 'onActorTypeBlur',
            'click #showTrigger' : 'expandSearch',
            'click #hideTrigger' : 'collapseSearch'
        },

        initialize: function(args) {
            this.template = _.template(templateHtml);
            this.countries = args.countries;
            this.mapProviders = args.mapProviders;
            this.loadData();
        },
        
        loadData: function() {
            var _self = this;
            var loadCount = 2;
            this.actorTypes = new CodeDefinitions('ACTOR_TYPE');
            this.actorTypes.fetch({success: function() {
                if(--loadCount == 0) {
                    _self.render();
                }
            }});
            this.eventTypes = new CodeDefinitions('EVENT_TYPE');
            this.eventTypes.fetch({success: function() {
                if(--loadCount == 0) {
                    _self.render();
                }
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
            var html = this.template({countries: this.countries, eventTypes: this.eventTypes});
            $(this.el).html(html);
            var _self = this;
            this.$('#actorType').autocomplete({
                minLength: 0,
                source: _self.extractLabelValuePairs(_self.actorTypes),
                focus: function (event, ui) {
                    _self.$('#actorType').val(ui.item.label);
                },
                select: function (event, ui) {
                    _self.$('#actorType').val(ui.item.label);
                    _self.$('#actor_type_pk').val(ui.item.value);
                    return false;
                }
            });
            this.$('#minDate').datepicker({
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
            this.$('#maxDate').datepicker({
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
        },

        search: function() {
            var properties = {};
            properties.countryPk =  Number(this.$('#country_pk').val());
            properties.locationPk = Number(this.$('#location_pk').val());
            properties.actorTypePk = Number(this.$('#actor_type_pk').val());
            properties.eventTypePk = Number(this.$('#event_type_pk').val());
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
                    return new Date(parts[2], parts[0] - 1, parts[1]).getTime();
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
        onActorTypeBlur: function(event) {
            var $pk = this.$('#actor_type_pk');
            var $target = $(event.target);
            var value = this.scrubInput($target.val());
            if (value != null && value.length > 0) {
                // This will normally already be set, but only if the pick a valid definition from the list.
                // Otherwise, this line of code will set it to null.
                var codeDefinition = this.actorTypes.findByDefinition(value);
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
        },

        onChangeCountry: function(event) {
            var $target = $(event.target);
            var $locationSelect = this.$('#location_pk');
            $locationSelect.prop('disabled', true);
            $locationSelect.html('<option value="-1" selected></option>');
            var $selectedOption = this.$('#country_pk option:selected');
            var _self = this;
            if ($target.val() != -1 && $selectedOption.length > 0) {
                var locations = new CodeDefinitions();
                var label = $selectedOption[0].label;
                locations.url = "http://data.exploringspatial.com/acled/" + label.split(' ').join('') + "/LOCATIONS.json";
                locations.fetch({
                    success: function () {
                        locations.each(function(codeDefinition){
                            $locationSelect.append('<option value="' + codeDefinition.get('codeDefinitionPk') + '">'+ codeDefinition.get('definition') + '</option>');
                        });
                        _self.$('#selectLocation').show();
                        $locationSelect.prop('disabled', false);
                    }
                });
            }
        },

        destroy: function() {
            // Remove view from DOM
            this.remove();
        }
        
    });

    return AcledSearchView;
});
