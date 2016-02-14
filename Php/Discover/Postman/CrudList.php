<?php
namespace Apps\Core\Php\Discover\Postman;

use Webiny\Component\StdLib\StdObject\StringObject\StringObject;

class CrudList extends AbstractEndPoint
{
    public function getRequests()
    {
        $this->requests[] = [
            'id'      => StringObject::uuid(),
            'headers' => 'Authorization:{{authorization}}',
            'url'     => '{{url}}/api/entities/' . $this->ep->getAppSlug() . '/' . $this->ep->getEntitySlug(),
            'method'  => 'GET',
            'data'    => [],
            'name'    => 'List ' . $this->str($this->ep->getEntityName())->pluralize(),
            'time'    => time(),
            'version' => '' . $this->ep->getAppVersion()
        ];

        return $this->requests;
    }
}
