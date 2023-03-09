import 
    React, 
    { 
        lazy, 
        Suspense 
    }                            from "react";
import { 
    BrowserRouter as Router, 
    Route, 
    Routes 
}                                from "react-router-dom";

import Login                     from "../modules/Login/Login";
import Logout                    from "../modules/Login/Logout";

import Registrations             from "../pages/admin/Import/Registrations";
import ImportTeams               from "../pages/admin/Import/ImportTeams";

import Welcome                   from "../pages/public/Welcome";
import Travel                    from "../pages/public/Travel";
import Recreational              from "../pages/public/Recreational";
import Coaching                  from "../pages/public/Coaching";
import Referees                  from "../pages/public/Referees";
import Safety                    from "../pages/public/Safety";
import Standings                 from "../pages/public/Standings";
import SpecialAlert              from "../pages/public/SpecialAlert";

import { AppContextProvider }    from "../context/AppContext";

const AccountUpdate = lazy( () => import("../pages/public/AccountUpdate"));

const Article       = lazy( () => import("../pages/admin/Articles/Article") );
const Articles      = lazy( () => import("../pages/admin/Articles/Articles") );

const ContactUs     = lazy( () => import("../pages/public/ContactUs") );

const Directors     = lazy( () => import("../pages/public/Directors") );

const Events        = lazy( () => import("../pages/admin/Events/Events") );

const Division       = lazy( () => import("../pages/admin/Divisions/Division") );
const Divisions      = lazy( () => import("../pages/admin/Divisions/Divisions") );

const Game           = lazy( () => import("../pages/admin/Games/Game"));
const Games          = lazy( () => import("../pages/admin/Games/Games"));

const Households    = lazy( () => import("../pages/admin/Households/Households"));

const Image         = lazy( () => import("../pages/admin/Images/Image") );
const Images        = lazy( () => import("../pages/admin/Images/Images") );

const JobRunner     = lazy( () => import("../pages/admin/System/JobRunner") );
const Jobs          = lazy( () => import("../pages/admin/System/Jobs") );
const SystemJob     = lazy( () => import("../pages/admin/System/SystemJob") );
  
const Logs          = lazy( () => import("../pages/admin/Debug/Logs") );
const Locations     = lazy( () => import("../pages/public/Locations") );

const Member        = lazy( () => import("../pages/admin/Members/Member") );
const Members       = lazy( () => import("../pages/admin/Members/Members") );

const Menu          = lazy( () => import("../pages/admin/Menu"));

const Minutes       = lazy( () => import("../pages/public/Minutes") );

const NewsArticle   = lazy( () => import("../pages/admin/NewsFeed/NewsArticle"));
const NewsFeed      = lazy( () => import("../pages/admin/NewsFeed/NewsFeed"));

const Seasons      = lazy( () => import("../pages/admin/Seasons/Seasons"));
const Season       = lazy( () => import("../pages/admin/Seasons/Season"));

const SponsorFeed   = lazy( () => import("../pages/public/Sponsors"));

const ModuleFilters = lazy( () => import("../pages/admin/Debug/ModuleFilters") );

const Team          = lazy( () => import("../pages/admin/Teams/Team"));
const Teams         = lazy( () => import("../pages/admin/Teams/Teams"));

const Schedule      = lazy( () => import("../pages/admin/Import/Schedule"));

const Sponsor       = lazy( () => import("../pages/admin/Sponsors/Sponsor"));
const Sponsors      = lazy( () => import("../pages/admin/Sponsors/Sponsors"));

const SystemProperties = lazy( () => import("../pages/admin/System/SystemProperties"));
const SystemProperty   = lazy( () => import("../pages/admin/System/SystemProperty"));

export default (
    <AppContextProvider>
        
            <Router>
                <Suspense fallback={ <>...</> }>
                    <Routes>
                        <Route path="/" exact                     element={<Welcome />}    />
                        <Route path="/account_update"             element={<AccountUpdate />} />
                        <Route path="/covid"                      element={<SpecialAlert />} />
                        <Route path="/travel"                     element={<Travel />}       />
                        <Route path="/recreational"               element={<Recreational />} />
                        <Route path="/standings"                  element={<Standings />}    />
                        <Route path="/coaching"                   element={<Coaching />}     />
                        <Route path="/referees"                   element={<Referees />}     />
                        <Route path="/safety"                     element={<Safety />}       />

                        <Route path="/contact_us"                 element={<ContactUs />}    />
                        <Route path="/locations"                  element={<Locations />}    />
                        <Route path="/minutes"                    element={<Minutes />}      />
                        <Route path="/sponsors"                   element={<SponsorFeed />}  />
                        <Route path="/directors"                  element={<Directors />}    />

                        <Route path="/admin/articles"             element={<Articles />}      />
                        <Route path="/admin/article"              element={<Article />}       />

                        <Route path="/admin/events"               element={<Events />}        />

                        <Route path="/admin/filters"              element={<ModuleFilters />} />

                        <Route path="/admin/games"                element={<Games />}         />
                        <Route path="/admin/game"                element={<Game />}           />

                        <Route path="/admin/game_schedule"        element={<Schedule />}      />

                        <Route path="/admin/divisions"            element={<Divisions />}     />
                        <Route path="/admin/division"             element={<Division />}      />

                        <Route path="/admin/households"           element={<Households />}    />

                        <Route path="/admin/images"               element={<Images />}        />
                        <Route path="/admin/image"                element={<Image />}         />

                        <Route path="/admin/import/registrations" element={<Registrations />} />
                        <Route path="/admin/import/teams"         element={<ImportTeams />}     />

                        <Route path="/admin/system/jobrunner"     element={<JobRunner />}       />
                        <Route path="/admin/system/jobs"          element={<Jobs />}            />
                        <Route path="/admin/system/job"           element={<SystemJob />}       />

                        <Route path="/admin/logs"                 element={<Logs />}          />

                        <Route path="/admin/members"              element={<Members />}       />
                        <Route path="/admin/member"               element={<Member />}        />

                        <Route path="/admin/menu"                 element={<Menu />}          />

                        <Route path="/admin/news/article"         element={<NewsArticle />}   />
                        <Route path="/admin/news/articles"        element={<NewsFeed />}      />

                        <Route path="/admin/seasons"             element={<Seasons />}      />
                        <Route path="/admin/season"              element={<Season />}       />

                        <Route path="/admin/sponsors"             element={<Sponsors />}      />
                        <Route path="/admin/sponsor"              element={<Sponsor />}       />

                        <Route path="/admin/system/properties"    element={<SystemProperties />} />
                        <Route path="/admin/system/property"      element={<SystemProperty />} />

                        <Route path="/admin/team"                 element={<Team />}          />
                        <Route path="/admin/teams"                element={<Teams />}         />

                        <Route path="/login"                      element={<Login />}         />
                        <Route path="/logout"                     element={<Logout />}        />
                        <Route path="*"                           element={<p>There's nothing here!</p>} />
                    </Routes>
                </Suspense>
            </Router>
    </AppContextProvider>
);