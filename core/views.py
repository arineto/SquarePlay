from django.shortcuts import render_to_response
from django.template import RequestContext
from django.conf import settings

# Create your views here.

def home(request):

	c = RequestContext(request)

	c['static'] = settings.STATIC_URL

	return render_to_response('board.html', c)