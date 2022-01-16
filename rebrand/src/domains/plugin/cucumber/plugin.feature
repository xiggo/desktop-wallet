Feature: Plugins

    @plugins-filterGame
    Scenario: Filter plugins by Game category
        Given Alice is on the plugins page
        When she filters plugins by game category
        Then only game plugins are displayed

    @plugins-filterUtility
    Scenario: Filter plugins by Utility category
        Given Alice is on the plugins page
        When she filters plugins by utility category
        Then only utility plugins are displayed

    @plugins-filterOther
    Scenario: Filter plugins by Other category
        Given Alice is on the plugins page
        When she filters plugins by other category
        Then only other plugins are displayed

    @plugins-filterMyPlugins
    Scenario: Filter plugins by My Plugins
        Given Alice is on the plugins page
        When she filters plugins by selecting my plugins
        Then only installed plugins are displayed
    
    @plugins-navigateToPluginDetails
    Scenario: Navigate to Plugin Details page and back
        Given Alice is on the plugins page
        When she clicks on a plugin
        Then she is navigated to the plugin details page
        When she selects plugins from the navbar
        Then she is navigated back to the plugin page 
