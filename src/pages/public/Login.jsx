import { useContext }       from 'react'

import AppContext           from '../store/AppContext'
import NoPanelLayout        from '../Layouts/NoPanelLayout'
import Errors               from '../Login/Errors'
import LoginWithEmailModal  from '../Login/LoginWithEmailModal'

const Login = () => {
    const context = useContext(AppContext);

    const doLogin = (email, password) => {
        context.doLogin(email, password);
    }

    const article = "lorem ipsum";

    return (
        <NoPanelLayout>
            <div className="news page-header">
                <LoginWithEmailModal onLogin={doLogin} />
                
                <div className="row">
                    <div className="col-12">
                        <h2 className="text-center">Log in</h2>
                    </div>
                </div>

                <div className="row"><div className="col-1">&nbsp;</div></div>

                <div className="row">
                    <div className="col-1">&nbsp;</div>        
                    <div className="col-11 col-md-5">
                        <h3>Administrator Login</h3>
                        <hr/>
                        <div className="row">
                            <div className="col-12">
                                <i className="fab fa-google"></i> Sign in with Google
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">&nbsp;</div>
                        </div>
                        <div className="row d-none">
                            <div className="col-12">
                                <div className="btn btn-block btn-social btn-facebook">
                                    <span className="fab fa-facebook-f"></span> Sign in with Facebook
                                </div>
                            </div>
                        </div>
                        <div className="row d-none">
                            <div className="col-12">&nbsp;</div>
                        </div>                        
                        <div className="row">
                            <div className="col-12">
                                <div className="btn btn-block btn-social btn-github" data-toggle="modal" data-target="#emailLogin">
                                    <i className="fal fa-envelope"></i> Sign in with EMail
                                </div>
                            </div>
                        </div>                        
                        <div className="row">
                            <div className="col-12">&nbsp;</div>
                        </div>                                    
                        <div className="row"><div className="col-12">&nbsp;</div></div>

                    </div>
                    <div className="col-11 col-md-5">
                        <h3>Members</h3>
                        <hr/>
                        { article }
                    </div>
                    <div className="col-11 col-md-5 d-none">

                        <h3>New Members</h3>
                        <hr/>
                        <Errors />
                        <div className="row">
                            <div className="col-12">
                                <form name="myForm">
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true} ng-model="user.first_name" className="form-control" placeholder="First name" aria-label="first_name" />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <input type="text" required={true} ng-model="user.last_name" className="form-control" placeholder="Last name" aria-label="last_name"  />
                                            <div className="alert alert-danger">Last Name is Required</div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true} ng-model="user.address_line1" className="form-control" placeholder="Address" aria-label="address" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group mb-3">
                                                <input type="text" ng-model="user.address_line2" className="form-control" placeholder="Address" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-8">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true}  ng-model="user.city" className="form-control" placeholder="City" />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-group mb-3">
                                                <input type="text" required={true}  ng-model="user.state" className="form-control" placeholder="State" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group mb-3">
                                                <input required={true} type="text" ng-model="user.zip_code"  className="form-control" placeholder="Zip code" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group mb-3">
                                                <input type="tel" required={true}  ng-model="user.mobile_phone" className="form-control phone" placeholder="Phone number" />
                                            </div>
                                        </div>
                                    </div>                
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="input-group mb-3">
                                                <input type="email" ng-model="user.email" className="form-control" placeholder="email" aria-label="email" aria-describedby="email" required={true} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">@</span>
                                                </div>
                                            </div>
                                            <small id="emailHelp" className="form-text text-muted">We'll never share your email or phone number with anyone else.</small>
                                            <div ng-messages="myForm.email.$error" role="alert">
                                                <div ng-message="required">Please enter a value for this field.</div>
                                                <div ng-message="email">This field must be a valid email address.</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <button type="button" className="btn btn-success">Create Account</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="row"><div className="col-12"><br/></div></div>
                    </div>
                    <div className="col-1">&nbsp;</div>
                </div>
            </div>
        </NoPanelLayout>
    )
}

export default Login;