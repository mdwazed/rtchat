import React from 'react';

function Call(props) {
    return (
        <div className="col-8">
            <div className="card mt-5">
                <div className="card-header">
                    <p>Calling UserName</p>
                </div>
                <div className="card-body">
                    <div className="row calling">
                        <div className="col-6">
                            <div className="decline-call">
                                <i className='bx bxs-phone-off' />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="receive-call">
                                <i className='bx bx-phone-call' />
                            </div>
                        </div>
                    </div>
                    .
                </div>
            </div>
        </div>
    );
}

export default Call;