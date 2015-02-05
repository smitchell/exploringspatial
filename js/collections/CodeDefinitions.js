/**
 * CodeDefinitions is a Backbone Collection of CodeDefinition Backbone Models.
 */
define([
        'backbone',
        'models/CodeDefinition'
], function(Backbone, CodeDefinition) {
var CodeDefinitions = Backbone.Collection.extend({
	url: function() {
        return "acled/" + this.category + ".json";
    },
	model: CodeDefinition,
    
    initialize: function(category) {
        this.category = category;
    },

    /**
     * Override Backbone parse to convert properties of properties into child Backbone models.
     * @param data
     * @returns {{}}
     */
    parse: function (data) {
        return data.definitions;
    },

    findByDefinition: function(definition) {
        return this.findByPropertyValue('definition', definition);
    },
    
    findByCode: function(code) {
        return this.findByPropertyValue('code', code);
    },

    findByCodeDefinitionPk: function(codeDefinitionPk) {
        return this.findByPropertyValue('codeDefinitionPk', codeDefinitionPk);
    },

    findByPropertyValue: function(property, value) {
        var keyValue;
        var result = null;
        this.each(function(codeDefinition) {
            keyValue = codeDefinition.get(property);
            if (keyValue === value) {
                result = codeDefinition;
            }
        });
        return result;
    }

});

    return CodeDefinitions;
});
