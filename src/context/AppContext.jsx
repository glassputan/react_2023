import      
    React,
    { 
        useCallback,
        useState, 
        useEffect, 
        useReducer 
    }                 from 'react'

import * as constants from '../constants';

import { 
    useTranslation 
}  from 'react-i18next';

import moment from 'moment';

import { 
    v4 as uuidv4 
}                               from 'uuid';


const AppContext = React.createContext(
    {
        cableTarget:                       "",
        defaultHeaders:                    "",
        token:                             "",
        locale:                            "",
        member:                            {},
        messages:                          [],
        moduleFilters:                     [],
        properties:                        {},
        isAdmin:                           false,
        isCoach:                           false,
        isReferee:                         false,
        isDebugging:                       false,
        debug:          (message, obj)     => {},
        warn:           (message, obj)     => {},
        error:          (message, obj)     => {},
        clearCache:     ()                 => {},
        deNullObject:   (object)           => {},
        getUUID:        ()                 => {},
        setCredentials: (token, member)    => {},
        setFieldStatus: (status)           => {},
        setLocale:      (locale)           => {},
        setLocation:    (location)         => {},
        setUserToken:   (token)            => {},
        setDebugging:   (bool)             => {},
        setMember:      (member)           => {},
        setMessage:     (message, v)       => {},
        setModuleFilters: (filters)        => {},
        doLogout:       ()                 => {},
        getCamelCase:   (string)           => {},
        getFormattedDateTime: (date)       => {},
        getFormattedDate: (date)           => {},
        getEpoch:         (string)         => {},
        getSetting:     (name)             => {},
        setSetting:     (name, value)      => {},
        getSettings:    ()                 => {},
        getSystemProperty: ()              => {},
        getFormattedDateTime:  (date)      => {},
        getFormattedDateTimeLocale: (date) => {},
        isAuthenticated:()                 => {},
        stripHtml:      (html)             => {},
        toCamelCase:    (text)             => {},
    }
)

export const AppContextProvider = (props) => {       
    const { i18n }                      = useTranslation();

    const defaultHeaders = {
        headers: {
            'Content-Type': 'application/json',
            "Accept":       "application/json",
            "Authorization": ""
        }
    };

    if( typeof localStorage != "undefined" ) {
        defaultHeaders.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }

    const [properties, setSystemProperties] = useState({});
    const [cableTarget, setCableTarget ]    = useState(constants.API_WS_ROOT);

    const [ resetCache,  setResetCache]     = useState(false);
    const [ token,      setToken      ]     = useState();
    const [ appState,   dispatchEvent ]     = useReducer(
        ( state, event ) => {
            switch(event.action) {
                case "MESSAGE":
                    return {
                        ...state,
                        messages: [...state.messages, { message: event.message, variant: event.variant }]
                    }
                case "DEBUGGING":
                    return {
                        ...state,
                        isDebugging: event.value
                    }
                case "IMPERSONATE":
                    return {
                        ...state,
                        impersonating: event.value
                    }
                case "LOCALE": 
                    return {
                        ...state,
                        locale: event.value
                    }
                case "ROLES":
                    return {
                        ...state,
                        roles: event.value
                    }
                case "USER_ROLES":
                    return {
                        ...state,
                        isAdmin: true
                    }
                case "TOKEN":
                    setToken(event.value);
                    break;
                case "MEMBER": 
                    return {
                        ...state,
                        member: event.value
                    }
                case "LOGIN": 
                    return {
                        ...state,
                        isLoggedIn: true
                    }
                case "LOGOUT":
                    return {
                        ...state,
                        member:     null,
                        token:      null,
                        isLoggedIn: false
                    }
                case "FILTERS":
                    return {
                        ...state,
                        filters: event.filters
                    }
                default:
                    break;
            }
        }, 
        { 
            impersonating:  null, 
            member:         null, 
            roles:          [],
            locale:         "en",
            isLoggedIn:     false,
            isDebugging:    true,
            messages:       [],
            filters:        []
        }
    );

    const getSystemProperty = (name, defaultValue) => {
        if( properties.hasOwnProperty(name) ) {
            return properties[name];
        }
        else {
            return defaultValue;
        }
    }

    const clearCache = () => {
        setResetCache(true);
    }

    // const getCableTarget = async () => {
    //     const response = await fetch("/api/v1/system/property?name=cable_url");

    //     debug("AppContext", "getCableURL()", response);

    //     if( response.ok ) {
    //         const json = await response.json();

    //         debug("AppContext", "getCableURL()", json);

    //         if(json.status == "error") {
    //             error("AppContext", "getCableURL()", statusText);
    //         }
    //         else {
    //             setCableTarget(json.record.value);
    //         }
    //     }
    //     else {
    //         error("AppContext", "getCableURL()", statusText);
    //     }
    // }    

    const getListFilters = async () => {        
        const request = await fetch(`/api/v1/module_filters`, defaultHeaders);

        if(request.ok) {
            const response = await request.json();

            // console.debug("AppContext::getListFilters()", response);

            const records = response.records.map(
                (filter) => {
                    if( filter.active == "1" || filter.active == "true" ) {
                        return {
                            ...filter,
                            active: true
                        }
                    }
                    else {
                        return {
                            ...filter,
                            active: false
                        }
                    }
                }
            )

            dispatchEvent( { action: "FILTERS", filters: records } );
        }
        else {
            console.error("getFilter()", request.statusText);
        }
    }

    const getFilterByName = (modName) => {
        let record = null;

        appState.filters.forEach(
            (filter) => {
                if( filter.name == modName ) {                    
                    record = filter;
                }
            }
        )

        if( null == record ) {
            /// console.info(`>> getFilterByName(): ${modName} was not found.`);
            record = { name: modName, active: true };
        }

        return record;
    }

    const getFilterByID = (filterId) => {
        let record = null;

        appState.filters.forEach(
            (filter) => {
                if( filter.id == filterId ) {
                    record = filter;
                }
            }
        )

        return record;
    }    

    const setModuleFilterHandler = async (event) => {

        const record = getFilterByID(event.target.id);

        if( record ) {
            const headers = {
                ...defaultHeaders,
                data: { module_filter: { ...record, value: event.target.value } },
                method: "PATCH"
            }

            const request = await fetch(`/api/v1/module_filters/${event.target.id}`, headers);

            if(request.ok) {
                const response = await request.json();

                //console.debug("AppContext::getListFilters()", response);

                const records = response.records.map(
                    (filter) => {
                        if( filter.active == "1" || filter.active == "true" ) {
                            return {
                                ...filter,
                                active: true
                            }
                        }
                        else {
                            return {
                                ...filter,
                                active: false
                            }
                        }
                    }
                )

                dispatchEvent( { action: "FILTERS", filters: records } );
            }
            else {
                console.error("setModuleFilterHandler()", request.statusText);
            }
        }
    }

    const debug = useCallback(
        async (p, message, extra) => {
            const environment = getSystemProperty("environment", "production"),
                  logLevel    = getSystemProperty("log_level",   "error");

            if( environment != "production" || logLevel == "debug" ) {
              // console.info(`${p}::${message}`, extra);
            }
        }
    )    

    const warn = (p, message, extra) => {
        if( getSystemProperty("log_level", "error") != "error" ) {

            const filter = getFilterByName(p);

            if( filter.active ) {
                if( extra ) {
                    console.warn(`${p}::${message}`, extra);
                }
                else {
                    console.warn(`${p}::${message}`);
                }
            }
        }
    };  
    
    const error = useCallback(
        async (p, message, extra) => {
            const filter = getFilterByName(p);

            if( filter.active ) {
                const extras  = JSON.stringify(extra || {}, null, 5);

                const record  = {
                    ...defaultHeaders,
                    body: JSON.stringify(
                        { 
                            app_log: {                                     
                                level:   "error", 
                                message: message, 
                                source:  p, 
                                json:    extras
                            } 
                        }
                    ),
                    method: "POST"
                };

                await fetch("/api/v1/log", record);
            }
        }
    )

    const getFormattedDateTime = (dateString) => {

        if( dateString ) {
            const date = moment(dateString);
            return date.format("yyyy-MM-DD HH:mm:ss.SSS");
        }

        return "";
    }

    const getFormattedTime = (dateString) => {

        if( dateString ) {
            const date = moment(dateString);
            return date.format("HH:mm:ss.SSS");
        }

        return "";
    }

    const getUUID = () => {
        return uuidv4().replaceAll("-", "");
    }

    const getCamelCase = (string) => {
        if( string && string.length > 0 ) {
            return string[0].toUpperCase() + string.substring(1);
        }

        return "";
    }
    
    const getFormattedDate = (dateString) => {

        if( dateString ) {
            const date = moment(dateString);
            return date.format("yyyy-MM-DD");
        }

        return "";
    }

    const getEpoch = (dateString) => {

        if( dateString ) {
            return moment(dateString).toDate().getTime();
        }

        return 0;
    }    

    const getFormattedDateTimeLocale = (dateString) => {
        
        if( dateString ) {
            const date = moment(dateString);
            return date.format("yyyy-MM-DDTHH:mm:ss");
        }

        return "";
    }
    
    const setMessage = (message, variant) => {
        dispatchEvent({ action: "MESSAGE", message: message, variant: variant ? variant : "info"} );
    }

    const setError = (message) => {
        dispatchEvent({ action: "MESSAGE", message: message, variant: "danger"} );
    }

    const setDebugging = (bool) => {
        dispatchEvent( 
            { 
                action: "DEBUGGING",  
                value:  bool 
            } 
        );
    }

    const deNullObject = (object) => {
        if( object ) {
            const record = {
                ...object
            };

            Object.keys(object).forEach(
                ( item ) => {
                    record[item] = object[item] || "";
                }
            )

            return record;
        }

        return {};
    }

    const setMemberHandler = (member, roles, mustChangePassword) => {
        debug("AppContext", "setMemberHandler()", member);

        if( member ) {
            dispatchEvent( { action: "MEMBER", value: member });

            if( roles ) {
                dispatchEvent( 
                    { 
                        action: "ROLES",
                        value:  roles.map(
                            (role) => {
                                if(role.active && !mustChangePassword) return role.name
                                return "N/A";
                            }
                        )
                    }
                );
            }
    
            if( member.locale ) {
                setLocaleHandler( member.locale );
            }
    
            dispatchEvent( { action: "LOGIN" });    
        }
        else {
            dispatchEvent( { action: "LOGOUT" });
        }
    }

    const setLocaleHandler = (locale) => {
        debug("AppContext", "setLocaleHandler('" + locale + "')");

        i18n.changeLanguage(locale);

        dispatchEvent( { action: "LOCALE", value: locale });
    }

    useEffect(
        async() => {
            setError(null);

            if( token ) {
                try {
                    const record = {
                        ...defaultHeaders,
                        body: JSON.stringify( { locale: appState.locale }),
                        method:  "POST"
                    };

                    const request  = await fetch(`/api/v1/locale`, record);
                    const response = await request.json();

                    debug("AppContext", "useEffect(locale)", response);

                    if( response.status && (response.status === "error" || response.status == "unauthorized")) {
                        throw new Error(response.message);
                    }
                    else {
                        setMessage("Locale was successfully changed.", "success");
                    }
                }
                catch(xx) {
                    setError( xx.message );
                }
            }
        },
        [appState.locale]
    )

    const logoutHandler = () => {
        localStorage.removeItem("token");

        dispatchEvent( { action: "LOGOUT" });
        fetch("/api/v1/logout");
    };

    const setUserTokenHandler = (token) => {
        debug("AppContext", "setUserTokenHandler()", token);

        localStorage.setItem("token", token);

        setToken(token);
    }

    const isAuthenticated = () => {
        return token && token != null;
    }

    const setMessageHandler = (message, variant) => {
        dispatchEvent( { action: "MESSAGE", message: message, variant: variant } );
    }

    const stripHtml = (html) => {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    const toCamelCase = (text) => {
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, 
            (word, index) => {
                return index === 0 ? word.toUpperCase() : word.toUpperCase();
            }
        ).replace(/\s+/g, '');
    }

    const getListSystemProperties = async () => {
        const response = await fetch("/api/v1/system/properties");

        if( response.ok ) {
            const json = await response.json();

            let props = {}

            json.records.forEach(
                (p) => {
                    props[p.name] = p.value;
                }
            )

            setSystemProperties(props);
        }
    }

    useEffect(
        async () => {
            if(resetCache) {
                getListSystemProperties();
                setResetCache(false); 
            }
        },
        [resetCache]
    )

    // If the token changes, then look it up and reauthenticate
    useEffect(
        async() => {
            setError(null);

            if( token ) {
                const response  = await fetch(`/api/v1/login`, defaultHeaders);

                if( response.ok ) {
                    const json = await response.json();

                    debug("AppContext", "Initial Token Detection", json);

                    if( json.status === "error" || json.status == "unauthorized" ) {
                        setError(json.message);
                    }
                    else {
                        setMemberHandler(json.member, json.roles, json.must_change_password);
                    }
                }
                else {
                    setError(response.statusText);
                }
            }
        },
        [token]
    )

    // Retrieve an encoded token from local storage.
    useEffect(
        async () => {
            getListSystemProperties();
            getListFilters();
            //getCableTarget();

            const token = localStorage.getItem("token");

            if( token ) {
                setToken(token);
            }
        }, 
        []
    );

    return ( 
        <AppContext.Provider value={
            {
                cableTarget:     cableTarget,
                defaultHeaders:  defaultHeaders,
                isAdmin:         appState.roles.includes("administrator"),
                isCoach:         appState.roles.includes("coach"),
                isReferee:       appState.roles.includes("referee"),
                isBoardMember:   appState.roles.includes("board"),
                isAssignor:      appState.roles.includes("assignor"),
                isLoggedIn:      appState.isLoggedIn, 
                isDebugging:     appState.isDebugging,
                member:          appState.member,
                messages:        appState.messages,
                moduleFilters:   appState.filters,
                properties:      properties,
                locale:          appState.locale,
                debug:                      debug,
                warn:                       warn,
                error:                      error,
                clearCache:                 clearCache,
                deNullObject:               deNullObject,
                doLogout:                   logoutHandler,
                getCamelCase:               getCamelCase,
                getFormattedDateTimeLocale: getFormattedDateTimeLocale,
                getFormattedDateTime:       getFormattedDateTime,
                getFormattedDate:           getFormattedDate,
                getFormattedTime:           getFormattedTime,
                getEpoch:                   getEpoch,
                getUUID:                    getUUID,
                getSystemProperty:          getSystemProperty,
                isAuthenticated:            isAuthenticated,
                setDebugging:               setDebugging,
                setLocale:                  setLocaleHandler,
                setUserToken:               setUserTokenHandler,
                setMember:                  setMemberHandler,
                setMessage:                 setMessageHandler,
                setModuleFilters:           setModuleFilterHandler,
                stripHtml:                  stripHtml,
                toCamelCase:                toCamelCase
            }
        }>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContext;