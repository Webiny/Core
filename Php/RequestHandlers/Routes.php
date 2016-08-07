<?php
/**
 * Webiny Platform (http://www.webiny.com/)
 *
 * @copyright Copyright Webiny LTD
 */

namespace Apps\Core\Php\RequestHandlers;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\Core\Php\DevTools\Response\HtmlResponse;

class Routes
{
    use WebinyTrait;

    public function handle()
    {
        $match = $this->wRouter()->match($this->wRequest()->getCurrentUrl());
        if ($match) {
            return new HtmlResponse($this->wRouter()->execute($match));
        }

        return null;
    }
}