import React, {Component} from 'react'

class ErrorMessage extends Component {
    render() {
        if(this.props.errorFlag) {
            return (
                <div>
                    { this.props.errorMessage }
                </div>
            )
        }
        return <div></div>
    }
}

export default ErrorMessage
