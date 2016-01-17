<?php
namespace Apps\Core\Php\DevTools\Response;

/**
 * Class HtmlResponse
 */
class HtmlResponse extends ResponseAbstract
{
    protected $html;

    public function __construct($html, $statusCode = 200)
    {
        $this->html = $html;
        $this->statusCode = $statusCode;
    }

    public function output()
    {
        return $this->html;
    }
}