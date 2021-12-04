.PHONY: dev-web dev-app clean

clean:
	rm -rf web/public/build/ web/node_modules/
	rm -rf app/frontend/

dev-app:
	make clean
	cp -r web/ app/frontend/
	cd app && wails dev

dev-web:
	cd web && yarn install && yarn dev
