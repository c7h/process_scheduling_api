from flask import Flask, jsonify, render_template
from flask_restful import Resource, Api, reqparse

from process_scheduler.common.serializer import JsonSerializer
from process_scheduler.common.parser import parseSyntax
from process_scheduler.scheduler.core import SchedulerFactory
from process_scheduler.process.process import ProcessManager
from process_scheduler.scheduler.timer import SystemTimer

from errors import error_translation

app = Flask(__name__)
api = Api(app, catch_all_404s=True, errors=error_translation)

class Scheduler(Resource):

	parser = reqparse.RequestParser()
	parser.add_argument('syntax', type=str, help="Process Description Syntax")
	parser.add_argument('initial_process', type=str, help="name of the initial process")

	def post(self, strategy, quantum=4, ts=10):
		#import pdb; pdb.set_trace()

		# parse process syntax
		args = self.parser.parse_args()
		processDescription = args.get("syntax")
		init_p = args.get("initial_process")
		# trying to parse the syntax
		parseSyntax(processDescription)

		# here comes the critical section: creating the Scheduler environmet including Singletons. 
		try:
			# generate scheduler
			scheduler = SchedulerFactory.getScheduler(str(strategy), quantum=quantum, timeslice=ts)
			# run scheduler
			scheduler.initialize(init_p)
			scheduler.run()
			# generate JSON
			json_result = JsonSerializer().generateData()
		except Exception as e:
			# pass the exceptions to the api - it will translate it to json-requests
			raise e
		finally:
			# we make sure that even after an exception, all Singletons get destroyed. 
			ProcessManager._drop()
			SystemTimer._drop()
		
		return json_result, 200

	@app.teardown_request
	def tearDown(self):
		SystemTimer._drop()
		ProcessManager._drop()

class SchedulerList(Resource):
	def get(self):
		possible_scheds = SchedulerFactory.getPossibleChoices()
		options = {"installed scheduler": possible_scheds}
		return jsonify(options)


# register endpoints 
api.add_resource(SchedulerList, '/scheduler')
api.add_resource(Scheduler, 
	'/schedule/with/<string:strategy>',
	'/schedule/with/<string:strategy>/timeslice/<int:ts>',
	'/schedule/with/<string:strategy>/timeslice/<int:ts>/quantum/<int:quantum>',
	'/schedule/with/<string:strategy>/quantum/<int:quantum>/timeslice/<int:ts>',
	)

# mainpage
@app.route("/", methods=['GET'])
def mainpage():
	return render_template('main.html')



if __name__ == '__main__':
    app.run(debug=True, threaded=True)