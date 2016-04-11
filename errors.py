#define your errors here...

error_translation = {
    'ValueError': {
        'message': "a process with the given name already exists",
        'status': 409,
        'extra' : "process names must be unique"
    },
    'IndexError': {
        'message': "Scheduler not Initialized",
        'status': 400,
    },
    'NotImplementedError': {
    	'message': "The requested scheduler is not implemented",
    	'status': 404,
    	'extra': "go for it and implement it!"
    }
}
