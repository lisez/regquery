package api

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	fp "path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Common struct {
	app *App
}

func NewCommon(app *App) *Common {
	return &Common{app}
}

func (c *Common) MultipleRegulationsFilePicker() ([]string, error) {
	return runtime.OpenMultipleFilesDialog(c.app.ctx, runtime.OpenDialogOptions{
		Title:            "Select File",
		AllowFiles:       true,
		AllowDirectories: true,
		ResolvesAliases:  true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Raw Regulations (*.docx)",
				Pattern:     "*.docx",
			}, {
				DisplayName: "Structural Regulations (*.json)",
				Pattern:     "*.json",
			},
		},
	})
}

func (c *Common) ReadFile(path string) ([]byte, error) {
	runtime.LogDebug(c.app.ctx, "Reading file: "+path)
	return ioutil.ReadFile(path)
}

func (c *Common) UploadFile(dest string, field string, filepath string) (map[string]interface{}, error) {
	bodyBuf := &bytes.Buffer{}
	bodyWriter := multipart.NewWriter(bodyBuf)
	{
		_, filename := fp.Split(filepath)

		fileWriter, err := bodyWriter.CreateFormFile(field, filename)
		if err != nil {
			fmt.Println("error writing to buffer")
			return nil, err
		}

		fh, err := os.Open(filepath)
		if err != nil {
			fmt.Println("error opening file")
			return nil, err
		}
		defer fh.Close()

		_, err = io.Copy(fileWriter, fh)
		if err != nil {
			return nil, err
		}
	}
	contentType := bodyWriter.FormDataContentType()
	bodyWriter.Close()

	resp, err := http.Post(dest, contentType, bodyBuf)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	content, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	r := make(map[string]interface{})
	r["statusCode"] = resp.StatusCode
	r["status"] = resp.Status
	r["body"] = string(content)

	return r, nil
}
